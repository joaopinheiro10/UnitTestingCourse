import {Utils} from '../app/utils'


describe('Utils test suite', () =>
{
    test('first test', () =>
    {
        const result = Utils.toUpperCase('abc');
        expect(result).toBe('ABC');
    });

    test('parse simple url', () =>
    {
        const parsedURL = Utils.parseURL('http://localhost:8080/login');
        expect(parsedURL.href).toBe('http://localhost:8080/login');
        expect(parsedURL.port).toBe('8080');
        expect(parsedURL.protocol).toBe('http:');
        expect(parsedURL.query).toEqual({});
    });

    test('parse url with query', () =>
    { 
        const parsedUrl = Utils.parseURL('http://localhost:8080/login?user=user&pass=pass');
        const expectQuery =
        {
            user: 'user',
            pass: 'pass'
        };

        expect(parsedUrl.query).toEqual(expectQuery);
    });
})