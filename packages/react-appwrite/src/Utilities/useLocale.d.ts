import type { Models } from "appwrite";
export declare function useLocale(): {
    locale: Models.Locale | null;
    loading: boolean;
    error: Error | null;
    listCountries: () => Promise<Models.CountryList>;
    listEUCountries: () => Promise<Models.CountryList>;
    listCountriesPhones: () => Promise<Models.PhoneList>;
    listCurrencies: () => Promise<Models.CurrencyList>;
    listLanguages: () => Promise<Models.LanguageList>;
    refetch: () => Promise<void>;
};
//# sourceMappingURL=useLocale.d.ts.map