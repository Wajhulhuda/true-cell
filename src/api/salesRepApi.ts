export interface SalesRep {
    id: number;
    name: string;
}

export const fetchSalesReps = async (): Promise<SalesRep[]> => {
    // Mock API with small delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 1, name: 'Shahid Khalid' },
                { id: 2, name: 'John Doe' }
            ]);
        }, 400);
    });
};
