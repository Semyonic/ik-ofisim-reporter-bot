export class TimeTrackerCreateRequest {

    private owner: number;
    private tarih: string;
    private izindir: boolean;
    private saat: number;
    private gorev: number;
    private proje: number;
    private aciklama: string;
    private shared_users: any;
    private shared_user_groups: any;
    private shared_users_edit: any;
    private shared_users_groups_edit: any;
    private related_timetracker: number;

    constructor(owner: number, tarih: string, saat: number, gorev: number, proje: number, aciklama: string) {
        this.owner = owner;
        this.tarih = tarih;
        this.saat = saat;
        this.gorev = gorev;
        this.proje = proje;
        this.aciklama = aciklama;
        this.izindir = false;
        this.shared_users = null;
        this.shared_user_groups = null;
        this.shared_users_edit = null;
        this.shared_users_groups_edit = null;
        this.related_timetracker = null;

    }
}