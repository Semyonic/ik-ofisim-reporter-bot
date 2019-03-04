import dotnev = require("dotenv");
import { ITimeTrackerListResponse } from './types/ITimeTrackerListResponse';
import * as requestPromise from 'request-promise';
import * as request from 'request';
import { Config } from './Config';
import { TimeTrackerCreateRequest } from './models/TimeTrackerCreateRequest';
import { ITimeTrackerCreateResponse } from './types/ITimeTrackerCreateResponse';

const {TOKEN, OWNER, USER_AGENT, ROLE, TIME_COUNT, PROJECT_ID} = process.env;

class App {

    private opts = {
        method: "POST",
        json: true,
        body: null,
        headers: {
            'User-Agent': USER_AGENT,
            'Content-Type': 'application/json;charset=UTF-8',
            'Content-Length': 1024,
            'Authorization': process.env.TOKEN,
        },
    };
    public dates: ITimeTrackerListResponse[];
    private resp: ITimeTrackerCreateResponse;

    constructor(token: string) { }

    getDates() {
        /*requestPromise.post(Config.ApiEndpoints.GetCreadtedDats, this.opts, ((req, res, err) => {
            if (err) {
                console.error(err);
            }
            this.dates = res.body;
            console.warn(res);
        }));*/
        request.post(Config.ApiEndpoints.GetCreadtedDats, this.opts, ((req, res, err) => {
            if (err) {
                console.error(err);
            }
            this.dates = res.body;
            console.warn(res);
        }));
    }

    createNewTimeTracker(reqOpts: TimeTrackerCreateRequest) {
        this.opts.body = JSON.stringify(reqOpts);
        // console.info(JSON.stringify(reqOpts));
        requestPromise.post(Config.ApiEndpoints.CreateDate, this.opts, ((req, res, err) => {
            if (err) {
                console.error(err);
            }
            // console.warn(res,req,err);
            this.resp = res.body;
        })).then((as) => {
            console.warn(as)
        });
    }
}

dotnev.config();
(() => {
    const app = new App(TOKEN);
    let tracker = new TimeTrackerCreateRequest(9722, '2019-03-07T00:00:00Z', 9, 696, 36, 'SDASDAS');
    app.getDates();
    ///app.createNewTimeTracker(tracker);
})();

