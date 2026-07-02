import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export const countryOptions = Object.entries(
  countries.getNames("en", { select: "official" })
)
  .map(([code, name]) => ({
    value: name,
    label: name,
    code,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));