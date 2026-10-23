import { EMPTY_PET_FORM, toPetDraft } from './petForm';

const today = new Date(2026, 9, 23); // 2026-10-23, local time
const valid = { ...EMPTY_PET_FORM, name: 'Luna' };

describe('toPetDraft birth date (RF-004)', () => {
  it('leaves birthDate out when the field is empty', () => {
    expect(toPetDraft(valid, today)).toEqual({ draft: { name: 'Luna', size: 'Medium' } });
  });

  it('sends a valid date as birthDate', () => {
    expect(toPetDraft({ ...valid, birthDate: ' 2021-05-10 ' }, today)).toEqual({
      draft: { name: 'Luna', size: 'Medium', birthDate: '2021-05-10' },
    });
  });

  it('accepts today and exactly 30 years ago', () => {
    expect('draft' in toPetDraft({ ...valid, birthDate: '2026-10-23' }, today)).toBe(true);
    expect('draft' in toPetDraft({ ...valid, birthDate: '1996-10-23' }, today)).toBe(true);
  });

  it.each(['10/05/2021', '2021-5-1', 'ayer', '2021-02-30', '2021-13-01'])('rejects the format of %s', (birthDate) => {
    expect(toPetDraft({ ...valid, birthDate }, today)).toEqual({
      errors: { birthDate: 'Escribe la fecha como AAAA-MM-DD, por ejemplo 2021-05-10.' },
    });
  });

  it('rejects a future date', () => {
    expect(toPetDraft({ ...valid, birthDate: '2026-10-24' }, today)).toEqual({
      errors: { birthDate: 'La fecha de nacimiento no puede ser futura.' },
    });
  });

  it('rejects a date older than 30 years', () => {
    expect(toPetDraft({ ...valid, birthDate: '1996-10-22' }, today)).toEqual({
      errors: { birthDate: 'La fecha de nacimiento no puede ser de hace más de 30 años.' },
    });
  });
});
