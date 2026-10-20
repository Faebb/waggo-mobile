import { devIdentityHeaders, setDevRole } from './devIdentity';

describe('devIdentity', () => {
  afterEach(() => setDevRole(null));

  it('sends no identity headers until a role is chosen', () => {
    expect(devIdentityHeaders()).toEqual({});
  });

  it('acts as the development owner', () => {
    setDevRole('owner');

    expect(devIdentityHeaders()).toEqual({ 'X-Dev-User-Id': 'dev-owner', 'X-Dev-Roles': 'owner' });
  });

  it('acts as the development walker, a different user than the owner', () => {
    setDevRole('walker');

    expect(devIdentityHeaders()).toEqual({ 'X-Dev-User-Id': 'dev-walker', 'X-Dev-Roles': 'walker' });
  });
});
