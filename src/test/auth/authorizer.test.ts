import {Authorizer} from '../../app/Authorization/Authorizer';
import {SessionTokenDBAccess} from '../../app/Authorization/SessionTokenDBAccess';
import {UserCredentialsDbAccess} from '../../app/Authorization/UserCredentialsDbAccess';
import {Account, SessionToken, TokenState} from '../../app/Models/ServerModels';
jest.mock('../../app/Authorization/SessionTokenDBAccess');
jest.mock('../../app/Authorization/UserCredentialsDbAccess');

describe('Authorizer test suite', () =>
{
    let authorizer: Authorizer;

    const sessionTokenDBAccessMock = {
        storeSessionToken: jest.fn(),
        getToken: jest.fn()
    };

    const userCredentialsDbAccessMock = {
        getUserCredential: jest.fn()
    };

    beforeEach(() =>
    {
        authorizer = new Authorizer(
            sessionTokenDBAccessMock as any,
            userCredentialsDbAccessMock as any
        );
    });

    afterEach(() =>
    {
        jest.clearAllMocks();
    });

    test('constructor arguments', () =>
    {
        new Authorizer;
        expect(SessionTokenDBAccess).toBeCalled();
        expect(UserCredentialsDbAccess).toBeCalled();
    });

    const someAccount: Account = {
        username: 'user',
        password: 'password'
    };

    test('should return session token for valid credentials', async () =>
    {
        jest.spyOn(global.Math, 'random').mockReturnValueOnce(0);
        jest.spyOn(global.Date, 'now').mockReturnValueOnce(0);

        userCredentialsDbAccessMock.getUserCredential.mockReturnValueOnce(
            {
                username: 'someUser',
                accessRights: [1, 2, 3]
            });

        const expectedSessionToken: SessionToken = {
            userName: 'someUser',
            accessRights: [1, 2, 3],
            valid: true,
            expirationTime: new Date(60 * 60 * 1000),
            tokenId: ''
        }

        const sessionToken = await authorizer.generateToken(someAccount);
        
        expect(expectedSessionToken).toEqual(sessionToken);
        expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(sessionToken);
    });

    describe('validateToken tests', () => 
    {
        test('validateToken returns invalid for null token', async () => 
        {
            sessionTokenDBAccessMock.getToken.mockReturnValueOnce(null);
            const sessionToken = await authorizer.validateToken('123');
            expect(sessionToken).toStrictEqual({
                accessRights: [],
                state: TokenState.INVALID
            });
        });

        test('validateToken returns expired for expired tokens', async () => 
        {
            const dateInPast = new Date(Date.now() - 1);
            sessionTokenDBAccessMock.getToken.mockReturnValueOnce({ valid: true, expirationTime: dateInPast });
            const sessionToken = await authorizer.validateToken('123');
            expect(sessionToken).toStrictEqual({
                accessRights: [],
                state: TokenState.EXPIRED
            });
        });

        test('validateToken returns valid for not expired and valid tokens', async () => 
        {
            const dateInFuture = new Date(Date.now() + 100000);
            sessionTokenDBAccessMock.getToken.mockReturnValue(
                {
                    valid: true,
                    expirationTime: dateInFuture,
                    accessRights: [1]
                });
            const sessionToken = await authorizer.validateToken('123');
            expect(sessionToken).toStrictEqual({
                accessRights: [1],
                state: TokenState.VALID
            });
        });
    });
})