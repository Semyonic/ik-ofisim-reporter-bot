"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotnev = require("dotenv");
const request = require("request");
var TimeSheetReporterBot;
(function (TimeSheetReporterBot) {
    var _a;
    dotnev.config();
    _a = process.env, TimeSheetReporterBot.TOKEN = _a.TOKEN, TimeSheetReporterBot.OWNER = _a.OWNER, TimeSheetReporterBot.USER_AGENT = _a.USER_AGENT, TimeSheetReporterBot.KITLE = _a.KITLE, TimeSheetReporterBot.DEPARTMENT = _a.DEPARTMENT, TimeSheetReporterBot.TIME_COUNT = _a.TIME_COUNT, TimeSheetReporterBot.PROJECT = _a.PROJECT, TimeSheetReporterBot.DESC = _a.DESC, TimeSheetReporterBot.REPORT_CHECK_INTERVAL = _a.REPORT_CHECK_INTERVAL;
    TimeSheetReporterBot.FILTER_FILEDS = ["owner", "week", "year", "timetracker_id", "created_by", "created_at", "updated_by",
        "updated_at", "custom_approver", "date_range", "toplam_saat", "ay", "month", "custom_approver_2", "calisan",
        "tamamlanan_saat", "tarih", "tamamlandi", "hafta_toplami", "kalan", "ilgili_ay", "approver", "process_date",
        "approver_order", "process_status_list"];
    /**
     * Haftasonunu işaret eder
     */
    let WeekEnds;
    (function (WeekEnds) {
        WeekEnds[WeekEnds["Friday"] = 5] = "Friday";
        WeekEnds[WeekEnds["Saturday"] = 6] = "Saturday";
        WeekEnds[WeekEnds["Sunday"] = 7] = "Sunday";
    })(WeekEnds = TimeSheetReporterBot.WeekEnds || (TimeSheetReporterBot.WeekEnds = {}));
    /**
     * Gönderim yapılacak API'lar
     */
    let ApiEndPoints;
    (function (ApiEndPoints) {
        ApiEndPoints["GetTrackers"] = "https://ik.ofisim.com/api/record/find/timetrackers";
        ApiEndPoints["GetCreatedTrackers"] = "https://ik.ofisim.com/api/record/find/timetracker_items";
        ApiEndPoints["CreateTracker"] = "https://ik.ofisim.com/api/record/create/timetracker_items?timezone_offset=180";
        ApiEndPoints["SendToApproval"] = "";
    })(ApiEndPoints = TimeSheetReporterBot.ApiEndPoints || (TimeSheetReporterBot.ApiEndPoints = {}));
    /**
     * ofisim.ik üzerinde bulunan Zaman Çizelgesi alanına
     * yapılan konfigürasyon doğrultusunda raporları girer,
     * her Cuma günü onay'a gönderir
     */
    class Bot {
        constructor() {
            this.opts = {
                method: "POST",
                json: true,
                body: null,
                headers: {
                    'User-Agent': TimeSheetReporterBot.USER_AGENT,
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Authorization': `Bearer ${TimeSheetReporterBot.TOKEN}`,
                },
            };
            this.getProps().then((values) => {
                this.getSome().then((res) => {
                    console.warn(res);
                });
            }).catch((err) => {
                console.error(err);
            });
        }
        /**
         * Kayıt yapılacak çizelgenin dolu olup olmadığını kontrol eder
         */
        getSome() {
            return __awaiter(this, void 0, void 0, function* () {
                this.opts.body = {
                    "fields": ["owner", "related_timetracker", "saat", "aciklama", "created_by", "created_at", "updated_by",
                        "updated_at", "tarih", "gorev", "faturalanabilir_faturalanmaz", "proje", "izindir", "opportunity",
                        "izinid", "kayit_kitle", "proje.projeler.proje_kisa_kodu", "opportunity.firsatlar.opportunity_name"],
                    "filters": [{
                            "field": "owner",
                            "operator": "equals",
                            "value": TimeSheetReporterBot.OWNER,
                            "no": 1
                        }, { "field": "related_timetracker", "operator": "equals", "value": yield this.trackerId, "no": 2 }],
                    "sort_field": "created_at",
                    "sort_direction": "desc",
                    "limit": 2000
                };
                return new Promise((resolve, reject) => {
                    request.post(ApiEndPoints.GetCreatedTrackers, this.opts, ((err, resp, body) => {
                        if (err) {
                            reject(err.message);
                        }
                        if (body.length < 1) {
                            resolve(this.hasRecords = false);
                        }
                    }));
                });
            });
        }
        /**
         * Zaman çizelgesi bilgilerini alır
         */
        getProps() {
            return __awaiter(this, void 0, void 0, function* () {
                this.opts.body = {
                    "fields": TimeSheetReporterBot.FILTER_FILEDS,
                    "filters": [{ "field": "week", "operator": "equals", "value": Bot.getDateInfos().weekNumber, "no": 1 }, {
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
                            "value": Number(TimeSheetReporterBot.OWNER),
                            "no": 4
                        }],
                    "limit": 1
                };
                return new Promise((resolve, reject) => {
                    request.post(ApiEndPoints.GetTrackers, this.opts, ((err, resp, body) => {
                        if (err || body.hasOwnProperty('message')) {
                            reject({ clientErr: err, respErr: body.message });
                        }
                        else {
                            resolve(body.filter((x) => {
                                return {
                                    value: () => {
                                        if (x.kalan === -45) {
                                            this.daysLeft = x.kalan;
                                            this.trackerId = x.timetracker_id;
                                            this.owner = x.owner;
                                        }
                                    }
                                };
                            }));
                        }
                    }));
                });
            });
        }
        /**
         * Zaman çizelgesi girişi yapar
         */
        createItem() {
            this.opts.body = {
                "owner": Number(TimeSheetReporterBot.OWNER),
                "tarih": Bot.getDateInfos().currentDate,
                "izindir": false,
                "kayit_kitle": TimeSheetReporterBot.KITLE,
                "saat": TimeSheetReporterBot.TIME_COUNT,
                "gorev": TimeSheetReporterBot.DEPARTMENT,
                "proje": TimeSheetReporterBot.PROJECT,
                "aciklama": TimeSheetReporterBot.DESC,
                "shared_users": null,
                "shared_user_groups": null,
                "shared_users_edit": null,
                "shared_user_groups_edit": null,
                "related_timetracker": this.trackerId
            };
            request.post(ApiEndPoints.CreateTracker, this.opts, ((err, resp, body) => {
                if (err)
                    return err.message;
                return body;
            }));
        }
        /**
         * Girişi yapılmış çizelgeleri onay'a gönderir
         */
        sendToApproval() {
            request.post(ApiEndPoints.SendToApproval, this.opts, ((err, resp, body) => {
                if (err)
                    return err.message;
                if (body.hasOwnProperty('created_at')) {
                    console.info('OK');
                }
            }));
        }
        static getDateInfos() {
            return {
                currentDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString().slice(0, -5),
                weekNumber: (() => {
                    let now = new Date();
                    let s = new Date(now.getFullYear(), 0, 1);
                    return Math.ceil((((now - s) / 86400000) + s.getDay() + 1) / 7);
                })(),
                monthNumber: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            };
        }
    }
    TimeSheetReporterBot.Bot = Bot;
    /**
     * Bot'u çalıştır
     */
    const app = new Bot();
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
                console.error(err);
            });
        }
    }, Number(TimeSheetReporterBot.REPORT_CHECK_INTERVAL));
})(TimeSheetReporterBot = exports.TimeSheetReporterBot || (exports.TimeSheetReporterBot = {}));
//# sourceMappingURL=app.js.map