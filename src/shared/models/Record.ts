export class Record {

    protected readonly owner = 9722;
    protected readonly izindir = false;
    protected readonly saat = 9;
    protected readonly proje = 24;
    protected readonly shared_users = null;
    protected readonly shared_user_groups = null;
    protected readonly shared_user_groups_edit = null;
    private _tarih: string;
    private _gorev: number;
    private _aciklama: string;
    private _related_timetracker: number;


    get tarih(): string {
        return this._tarih;
    }

    set tarih(value: string) {
        this._tarih = value;
    }

    get gorev(): number {
        return this._gorev;
    }

    set gorev(value: number) {
        this._gorev = value;
    }

    get aciklama(): string {
        return this._aciklama;
    }

    set aciklama(value: string) {
        this._aciklama = value;
    }

    get related_timetracker(): number {
        return this._related_timetracker;
    }

    set related_timetracker(value: number) {
        this._related_timetracker = value;
    }
}
