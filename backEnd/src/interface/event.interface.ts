export interface ICreateEvent {
    name : string;
    description : string;
    category : string;
    location : string;
    paid : boolean;
    price : number;
    start_date : Date;
    end_date : Date;
    total_seats : number;
}
