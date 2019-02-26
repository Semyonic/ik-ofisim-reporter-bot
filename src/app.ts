import * as request from 'request';
import {Constants} from "./shared/Constants";
import {Record} from "./shared/models/Record";
import * as env from 'dotenv';

/**
 * Initialize envars before starting application
 */
env.config();

class ReporterApp {
    /**
     * node request instance
     */
    public request;
    /**
     * Request data model
     */
    public requestData: Record = new Record();
    /**
     * Request options
     */
    public requestOptions = {
        method: 'POST',
        body: this.requestData,
        json: true,
        url: Constants.GET_TIME_RECORDS,
        headers: {
            'Authorization': `Bearer ${process.env.IK_OFISIM_TOKEN}`
        }
    };


    constructor() {
        this.request = request;
        console.warn(this.requestOptions);
        this.getReportCalendar();
    }

    getReportCalendar() {
        this.request.post(this.requestOptions, function (error, response, body) {
            console.log(body);
        });
    }

    createReport() {

    }
}

setInterval(() => {
    new ReporterApp();
}, 5000);
