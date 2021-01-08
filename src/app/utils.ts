import {UrlWithParsedQuery, parse} from "url";

export class Utils
{

    public static parseURL(url: string): UrlWithParsedQuery
    {
        if (!url)
        {
            throw new Error('Empty URL');
        }
        return parse(url, true);
    }

    /* istanbul ignore next */
    public static toUpperCase(arg: string)
    {
        return arg.toUpperCase();
    }
}