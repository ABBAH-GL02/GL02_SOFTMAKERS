import { discoverSujetStructure } from "../../actions/chercherQuestions.js";

describe('Spec_F1 - Recherche et affichage de questions (structure SujetB_data)', () => {
  it('devrait découvrir les unités et pages présentes dans SujetB_data', async () => {
    const units = await discoverSujetStructure(`${process.cwd()}/SujetB_data`);

    expect(typeof units).toBe('object');
    const unitKeys = Object.keys(units);
    expect(unitKeys.length).toBeGreaterThan(0);

    // s'assurer que U1 et U3 existent (présents dans le dataset fourni)
    expect(unitKeys).toContain('U1');
    expect(unitKeys).toContain('U3');

    // vérifier que U1 contient des pages connues (p7 / p8_9 / p10)
    const u1pages = Object.keys(units['U1']);
    expect(u1pages.length).toBeGreaterThan(0);
    expect(u1pages).toContain('p7');
  });
});
