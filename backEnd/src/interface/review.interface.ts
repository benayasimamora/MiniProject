export interface ICreateReviewInput {
    rating: number;
    comment: string;
}

export interface IReviewOutput {
    id: number;
    userId: number;
    eventId: number;
    transactionId: number;
    rating: number;
    comment: string;
    createdAt: Date;
    user?: {
        fullName: string;
        profilePicture?: string | null;
    };
    event?: {
        name: string;
    }
}