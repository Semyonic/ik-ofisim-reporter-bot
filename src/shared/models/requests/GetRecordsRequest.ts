export interface IRecordFilter {
    field: string;
    operator: string;
    value: number;
    no: number
}

export class GetRecordsRequest {
    public fields;
    public filters: IRecordFilter[];
    public sort_field: string;
    public sort_direction: string;
    public limit: number;
}
