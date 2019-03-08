import dotnev = require("dotenv");
import request = require("request");

export module TimeSheetReporterBot {

    dotnev.config();
    export const {TOKEN, OWNER, USER_AGENT, KITLE, DEPARTMENT, TIME_COUNT, PROJECT, DESC, REPORT_CHECK_INTERVAL} = process.env;
    export const FILTER_FILEDS = ["owner", "week", "year", "timetracker_id", "created_by", "created_at", "updated_by",
        "updated_at", "custom_approver", "date_range", "toplam_saat", "ay", "month", "custom_approver_2", "calisan",
        "tamamlanan_saat", "tarih", "tamamlandi", "hafta_toplami", "kalan", "ilgili_ay", "approver", "process_date",
        "approver_order", "process_status_list"];

    /**
     * Haftasonunu işaret eder
     */
    export enum WeekEnds {
        Friday = 5,
        Saturday = 6,
        Sunday = 7,
    }

    /**
     * Gönderim yapılacak API'lar
     */
    export enum ApiEndPoints {
        GetTrackers = 'https://ik.ofisim.com/api/record/find/timetrackers',
        GetCreatedTrackers = 'https://ik.ofisim.com/api/record/find/timetracker_items',
        CreateTracker = 'https://ik.ofisim.com/api/record/create/timetracker_items?timezone_offset=180',
        SendToApproval = ''
    }

    export interface ITimeTrackerCreateResponse {
        owner: number;
        tarih: Date;
        izindir: boolean;
        saat: number;
        gorev: string;
        proje: number;
        aciklama: string;
        shared_users?: any;
        shared_user_groups?: any;
        shared_users_edit?: any;
        shared_user_groups_edit?: any;
        related_timetracker: number;
        id: number;
        created_by: number;
        updated_by: number;
        created_at: Date;
        updated_at: Date;
        deleted: boolean;
    }

    export class ITimeTrackerCreateRequest {
        owner: number;
        tarih: Date;
        izindir: boolean;
        kayit_kitle?: number;
        saat: number;
        gorev: number;
        proje: number;
        aciklama: string;
        shared_users?: number;
        shared_user_groups?: number;
        shared_users_edit?: number;
        shared_user_groups_edit?: number;
        related_timetracker: number;
    }

    export interface ITimeTrackerListResponse {
        id: number,
        owner: number,
        week: number,
        year: number,
        timetracker_id: number,
        shared_users: number,
        shared_user_groups: number,
        shared_users_edit: number,
        shared_user_groups_edit: number,
        is_sample: boolean,
        is_converted: boolean,
        master_id: number,
        migration_id: number,
        import_id: number,
        created_by: number,
        updated_by: number,
        created_at: Date,
        updated_at: Date,
        deleted: boolean,
        custom_approver: string,
        date_range: string,
        toplam_saat: number,
        ay: null,
        month: number,
        custom_approver_2: string,
        calisan: number,
        tamamlanan_saat: string,
        tarih: Date,
        tamamlandi: boolean,
        hafta_toplami: number,
        kalan: number,
        ilgili_ay: 'Mart',
        onaylayici: null,
        onay_durumu: null,
        onay_islem_tarihi: null,
        onayci_sirasi: null,
        approver: number,
        process_date: Date,
        approver_order: number,
        process_status_list: string
    }

    export class TimeTrackerListRequest {

        protected fields: string[];
        private filters = [];
        private limit;

        constructor() {
            this.fields = [
                "owner",
                "week",
                "year",
                "timetracker_id",
                "created_by",
                "created_at",
                "updated_by",
                "updated_at",
                "custom_approver",
                "date_range",
                "toplam_saat",
                "ay",
                "month",
                "custom_approver_2",
                "calisan",
                "tamamlanan_saat",
                "tarih",
                "tamamlandi",
                "hafta_toplami",
                "kalan",
                "ilgili_ay",
                "approver",
                "process_date",
                "approver_order",
                "process_status_list"
            ];
            this.filters = [
                {
                    "field": "week",
                    "operator": "equals",
                    "value": 10,
                    "no": 1
                },
                {
                    "field": "year",
                    "operator": "equals",
                    "value": 2019,
                    "no": 2
                },
                {
                    "field": "month",
                    "operator": "equals",
                    "value": 3,
                    "no": 3
                },
                {
                    "field": "owner",
                    "operator": "equals",
                    "value": 9722,
                    "no": 4
                }
            ];
            this.limit = 1;
        }
    }

    export class TimeTrackerCreateRequest {

        private readonly owner: number;
        private readonly tarih: string;
        private readonly izindir: boolean;
        private readonly kayit_kitle: number;
        private readonly saat: number;
        private readonly gorev: number;
        private readonly proje: number;
        private readonly aciklama: string;
        private readonly shared_users: any;
        private readonly shared_user_groups: any;
        private readonly shared_users_edit: any;
        private readonly shared_user_groups_edit: any;
        private readonly related_timetracker: number;

        constructor(
            owner: number, tarih: string, izin: boolean,
            kitle: number, saat: number, bolum: number,
            proje: number, aciklama: string) {
            this.owner = owner;
            this.tarih = tarih;
            this.izindir = izin;
            this.kayit_kitle = kitle;
            this.saat = saat;
            this.gorev = bolum;
            this.proje = proje;
            this.aciklama = aciklama;
            this.shared_users = null;
            this.shared_user_groups = null;
            this.shared_users_edit = null;
            this.shared_user_groups_edit = null;
            this.related_timetracker = null;
        }

        json() {
            return JSON.stringify(this);
        }
    }

    /**
     * ofisim.ik üzerinde bulunan Zaman Çizelgesi alanına
     * yapılan konfigürasyon doğrultusunda raporları girer,
     * her Cuma günü onay'a gönderir
     */
    export class Bot {

        /**
         * Gönderimi yapılacak bilgiler için ön hazırlık
         */
        private opts = {
            method: "POST",
            json: true,
            body: null,
            headers: {
                'User-Agent': USER_AGENT,
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': `Bearer ${TOKEN}`,
            },
        };
        private owner: number;
        private trackerId: number;
        private isCompleted: boolean = false;
        private daysLeft: number;

        constructor() {
            this.getTrackerId();
        }

        getTrackerId() {
            this.opts.body = {
                "fields": FILTER_FILEDS,
                "filters": [{"field": "week", "operator": "equals", "value": 11, "no": 1}, {
                    "field": "year",
                    "operator": "equals",
                    "value": 2019,
                    "no": 2
                }, {"field": "month", "operator": "equals", "value": 3, "no": 3}, {
                    "field": "owner",
                    "operator": "equals",
                    "value": 9722,
                    "no": 4
                }],
                "limit": 1
            };
            request.post(ApiEndPoints.GetTrackers, this.opts, ((err: Error, resp, body: ITimeTrackerListResponse[]) => {
                if (err) return err.message;
                body.filter((x) => {
                    if (x.kalan === -45) {
                        this.daysLeft = x.kalan;
                        this.trackerId = x.timetracker_id;
                        this.owner = x.owner;
                    }
                });
            }));
        }

        /**
         * Zaman çizelgesi girişi yapar
         */
        createItem() {
            this.opts.body = {
                "owner": OWNER,
                "tarih": new Date(new Date().setHours(0, 0, 0, 0)).toISOString().slice(0, -5),
                "izindir": false,
                "kayit_kitle": KITLE,
                "saat": TIME_COUNT,
                "gorev": DEPARTMENT,
                "proje": PROJECT,
                "aciklama": DESC,
                "shared_users": null,
                "shared_user_groups": null,
                "shared_users_edit": null,
                "shared_user_groups_edit": null,
                "related_timetracker": this.trackerId
            };
            request.post(ApiEndPoints.CreateTracker, this.opts, ((err: Error, resp, body: ITimeTrackerCreateResponse) => {
                if (err) return err.message;
                return body;
            }));
        }

        /**
         * Girişi yapılmış çizelgeleri onay'a gönderir
         */
        sendToApproval() {
            request.post(ApiEndPoints.SendToApproval, this.opts, ((err: Error, resp, body: ITimeTrackerCreateResponse) => {
                if (err) return err.message;
                if (body.hasOwnProperty('created_at')) {
                    console.info('OK')
                }
            }));
        }

    }

    /**
     * Bot'u çalıştır
     */
    const app = new Bot();
    app.createItem();

    /**
     * Belirtilen sıklıkta(milisaniye) kontrolleri çalıştırıp
     * gerekli fonksiyonlarını yerine getirir
     */
    setInterval(() => {
        /**
         * İçinde bulunduğu günün, haftaiçi olup olmadığını ayrıt eder
         * zaman çizelgesine giriş yapar.
         */
        if (!Object.values(WeekEnds).includes(new Date().getDay())) {
            app.createItem();
            /**
             * Cuma günü geldiğinde onay'a gönderir
             */
            if (new Date().getDay() === WeekEnds.Friday) {
                app.sendToApproval();
            }
        }
    }, Number(REPORT_CHECK_INTERVAL));
}
