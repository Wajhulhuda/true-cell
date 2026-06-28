import create from 'zustand';
import { persist } from 'zustand/middleware';
import type { Invoice } from 'types/invoice';

export interface LoggedInRep {
    id: number;
    name: string;
    code: string;
}

interface InvoiceStore {
    loggedInRep: LoggedInRep | null;
    selectedRepresentative: string | null;
    currentInvoice: Invoice | null;
    invoiceHistory: Invoice[];
    setLoggedInRep: (rep: LoggedInRep | null) => void;
    setRepresentative: (name: string | null) => void;
    saveInvoice: (invoice: Invoice) => void;
    addToHistory: (invoice: Invoice) => void;
    updateInHistory: (invoice: Invoice) => void;
    deleteFromHistory: (invoiceNumber: string) => void;
    clearInvoice: () => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
    persist(
        (set) => ({
            loggedInRep: null,
            selectedRepresentative: null,
            currentInvoice: null,
            invoiceHistory: [],
            setLoggedInRep: (rep) =>
                set({ loggedInRep: rep, selectedRepresentative: rep?.name ?? null }),
            setRepresentative: (name) => set({ selectedRepresentative: name }),
            saveInvoice: (invoice) => set({ currentInvoice: invoice }),
            addToHistory: (invoice) =>
                set((state) => ({
                    invoiceHistory: [
                        invoice,
                        ...state.invoiceHistory.filter(
                            (i) => i.invoiceNumber !== invoice.invoiceNumber
                        ),
                    ],
                })),
            updateInHistory: (invoice) =>
                set((state) => ({
                    invoiceHistory: state.invoiceHistory.map((i) =>
                        i.invoiceNumber === invoice.invoiceNumber ? invoice : i
                    ),
                })),
            deleteFromHistory: (invoiceNumber) =>
                set((state) => ({
                    invoiceHistory: state.invoiceHistory.filter(
                        (i) => i.invoiceNumber !== invoiceNumber
                    ),
                })),
            clearInvoice: () => set({ currentInvoice: null }),
        }),
        {
            name: 'invoice-store',
            partialize: (state) => ({
                loggedInRep: state.loggedInRep,
                selectedRepresentative: state.selectedRepresentative,
                currentInvoice: state.currentInvoice,
                invoiceHistory: state.invoiceHistory,
            }),
        }
    )
);
