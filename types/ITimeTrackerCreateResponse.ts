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
