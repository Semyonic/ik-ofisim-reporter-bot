import dotnev = require('dotenv');
import request = require('request');

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
        Sunday = 0,
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

    /**
     * ofisim.ik üzerinde bulunan Zaman Çizelgesi alanına
     * yapılan konfigürasyon doğrultusunda raporları girer,
     * her Cuma günü onay'a gönderir
     */
    export class Bot {

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
        private daysLeft: number;
        private nextTracker: number;
        private hasRecords: boolean;

        constructor() {
            this.getProps().then(() => {
                this.getSome()
            }).catch((err) => {
                console.error(err);
            });
        }

        private static getDateInfos() {
            return {
                currentDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString().slice(0, -5),
                weekNumber: (() => {
                    let now: any = new Date();
                    let s: any = new Date(now.getFullYear(), 0, 1);
                    return Math.ceil((((now - s) / 86400000) + s.getDay() + 1) / 7);
                })(),
                monthNumber: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            }
        }

        /**
         * Kayıt yapılacak çizelgenin dolu olup olmadığını kontrol eder
         */
        async getSome() {
            this.opts.body = {
                "fields": ["owner", "related_timetracker", "saat", "aciklama", "created_by", "created_at", "updated_by",
                    "updated_at", "tarih", "gorev", "faturalanabilir_faturalanmaz", "proje", "izindir", "opportunity",
                    "izinid", "kayit_kitle", "proje.projeler.proje_kisa_kodu", "opportunity.firsatlar.opportunity_name"],
                "filters": [{
                    "field": "owner",
                    "operator": "equals",
                    "value": OWNER,
                    "no": 1
                }, {"field": "related_timetracker", "operator": "equals", "value": await this.trackerId, "no": 2}],
                "sort_field": "created_at",
                "sort_direction": "desc",
                "limit": 2000
            };
            return new Promise((resolve, reject) => {
                request.post(ApiEndPoints.GetCreatedTrackers, this.opts,
                    ((err: Error, resp, body: ITimeTrackerListResponse[]) => {
                        if (err) {
                            reject(err.message);
                        }
                        if (body.length < 1) {
                            this.hasRecords = false;
                            resolve();
                        }
                    }));
            });
        }

        /**
         * Zaman çizelgesi bilgilerini alır
         */
        async getProps() {
            this.opts.body = {
                "fields": FILTER_FILEDS,
                "filters": [{"field": "week", "operator": "equals", "value": Bot.getDateInfos().weekNumber, "no": 1}, {
                    "field": "year",
                    "operator": "equals",
                    "value": new Date().getFullYear(),
                    "no": 2
                }, {
                    "field": "month",
                    "operator": "equals",
                    "value": Bot.getDateInfos().monthNumber,
                    "no": Bot.getDateInfos().monthNumber
                }, {
                    "field": "owner",
                    "operator": "equals",
                    "value": Number(OWNER),
                    "no": 4
                }],
                "limit": 1
            };
            return new Promise((resolve, reject) => {
                request.post(ApiEndPoints.GetTrackers, this.opts, (
                    (err: Error, resp, body: ITimeTrackerListResponse[] | any) => {
                        if (err || body.hasOwnProperty('message')) {
                            reject({clientErr: err, respErr: body.message});
                        } else {
                            resolve(body.filter((x) => {
                                return {
                                    value: (() => {
                                        if (x.kalan === -45) {
                                            this.daysLeft = x.kalan;
                                            this.trackerId = x.timetracker_id;
                                            this.owner = x.owner;
                                        }
                                    })()
                                }
                            }));
                        }
                    }));
            });
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

        /**
         * Zaman çizelgesi girişi yapar
         */
        createItem() {
            this.opts.body = {
                "owner": Number(OWNER),
                "tarih": Bot.getDateInfos().currentDate,
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

    }

    /**
     * Bot'u çalıştır
     */
    const app = new Bot();

    /**
     * Belirtilen sıklıkta(milisaniye) kontrolleri çalıştırıp
     * gerekli fonksiyonları yerine getirir
     */
    setInterval(() => {
        /**
         * İçinde bulunduğu günün, haftaiçi olup olmadığını ayrıt eder
         * zaman çizelgesine giriş yapar.
         */
        if (!Object.values(WeekEnds).includes(new Date().getDay())) {
            app.getProps().then(() => {
                app.createItem();
                /**
                 * Cuma günü geldiğinde onay'a gönderir
                 */
                if (new Date().getDay() === WeekEnds.Friday) {
                    app.sendToApproval();
                }
            }).catch((err) => {
                console.error(err);
            }).catch((err) => {
                console.error(err)
            });
        }
    }, Number(REPORT_CHECK_INTERVAL));
}
