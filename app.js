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
const http = require("http");
const server = http.createServer().listen(3000);
const request = require("request");
var TimeSheetReporterBot;
(function (TimeSheetReporterBot) {
    var _a;
    dotnev.config();
    _a = process.env, TimeSheetReporterBot.TOKEN = _a.TOKEN, TimeSheetReporterBot.OWNER = _a.OWNER, TimeSheetReporterBot.USER_AGENT = _a.USER_AGENT, TimeSheetReporterBot.KITLE = _a.KITLE, TimeSheetReporterBot.DEPARTMENT = _a.DEPARTMENT, TimeSheetReporterBot.TIME_COUNT = _a.TIME_COUNT, TimeSheetReporterBot.PROJECT = _a.PROJECT, TimeSheetReporterBot.DESC = _a.DESC, TimeSheetReporterBot.REPORT_CHECK_INTERVAL = _a.REPORT_CHECK_INTERVAL;
    TimeSheetReporterBot.ROUTES = { root: '/', start: '/start', health: '/health', kill: '/kill', stop: '/stop', info: '/info' };
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
        WeekEnds[WeekEnds["Sunday"] = 0] = "Sunday";
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
            this.currentDateInfo = Bot.getDateInfos();
            this.getProps().then(() => {
                this.getSome().then();
            }).catch((err) => {
                console.error(err);
            });
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
                            this.hasRecords = false;
                            resolve();
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
                            reject({ clientErr: err, respErr: body.message, detail: this.opts });
                        }
                        else {
                            resolve(body.filter((x) => {
                                return {
                                    value: (() => {
                                        if (x.kalan === -45) {
                                            this.daysLeft = x.kalan;
                                            this.trackerId = x.timetracker_id;
                                            this.owner = x.owner;
                                        }
                                    })()
                                };
                            }));
                        }
                    }));
                });
            });
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
    }
    class Server {
        constructor(bot) {
            this.bot = bot;
            this.server = server;
            this.hasInstance();
            this.startBot();
            this.commandHandler();
            this.dateInfo = { CurrentWeekNumber: this.bot.currentDateInfo };
            this.tokenInfo = { AuthToken: this.bot.opts.headers.Authorization };
            console.warn('Server started at', server.address()['port']);
        }
        hasInstance() {
            if (this.bot instanceof Bot) {
                return this.bot;
            }
            else {
                return false;
            }
        }
        startBot() {
            if (this.instance === undefined) {
                this.instance = setInterval(() => {
                    console.info('Bot is running');
                    if (!Object.values(WeekEnds).includes(new Date().getDay())) {
                        this.bot.getProps().then(() => {
                            this.bot.createItem();
                            if (new Date().getDay() === WeekEnds.Friday) {
                                this.bot.sendToApproval();
                            }
                        }).catch((err) => {
                            console.error(err);
                        }).catch((err) => {
                            console.error(err);
                        });
                    }
                }, Number(TimeSheetReporterBot.REPORT_CHECK_INTERVAL));
                return 'Started ...';
            }
            else {
                return 'Cannot start. An instance already running';
            }
        }
        debugBot() {
            return {
                running: (() => {
                    return this.instance !== undefined;
                })(),
                date: this.dateInfo,
                auth: this.tokenInfo,
            };
        }
        killBot() {
            if (this.instance === undefined) {
                return 'Cannot kill already killed bot !';
            }
            else {
                this.instance = clearInterval(this.instance);
                return 'Bot killed !';
            }
        }
        commandHandler() {
            server.on('request', (request, response) => {
                if (request.method === 'GET') {
                    switch (request.url) {
                        case TimeSheetReporterBot.ROUTES.info:
                            response.end(JSON.stringify(this.debugBot(), null, 4));
                            break;
                        default:
                            response.end('No such command !');
                            break;
                    }
                }
                else if (request.method === 'POST') {
                    switch (request.url) {
                        case TimeSheetReporterBot.ROUTES.start:
                            response.end(this.startBot());
                            break;
                        case TimeSheetReporterBot.ROUTES.kill:
                            response.end(this.killBot());
                            break;
                        default:
                            response.end('No such command');
                            break;
                    }
                }
            });
        }
    }
    TimeSheetReporterBot.bt = new Bot();
    TimeSheetReporterBot.srv = new Server(TimeSheetReporterBot.bt);
    TimeSheetReporterBot.Instance = () => {
        return { Bot: TimeSheetReporterBot.bt, srv: TimeSheetReporterBot.srv };
    };
})(TimeSheetReporterBot = exports.TimeSheetReporterBot || (exports.TimeSheetReporterBot = {}));
(() => {
    TimeSheetReporterBot.Instance();
})();
//# sourceMappingURL=app.js.map