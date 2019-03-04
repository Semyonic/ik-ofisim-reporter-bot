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