const { HOME_CARDS } = require("./homeCards");

describe("home screen cards", () => {
  it("gives every card a non-empty title and body (coherent style)", () => {
    expect(HOME_CARDS.length).toBeGreaterThan(0);
    for (const card of HOME_CARDS) {
      expect(typeof card.title).toBe("string");
      expect(card.title.trim()).not.toBe("");
      expect(typeof card.body).toBe("string");
      expect(card.body.trim()).not.toBe("");
    }
  });

  it("has unique card titles (used as React keys)", () => {
    const titles = HOME_CARDS.map((c) => c.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("adds the 'Release gates' card as the third card", () => {
    expect(HOME_CARDS[2]).toEqual({
      title: "Release gates",
      body:
        "Every release passes a human approval gate before the (mocked) store " +
        "submit.",
    });
  });
});
