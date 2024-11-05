// Pokemon exists. 200
// get request: http://127.0.0.1:8000/pokemon?name=ditto
pm.test("Status code is 200 when Pokémon exists", function () {
  pm.response.to.have.status(200);
});

pm.test("Response contains success key", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("success");
});

pm.test("Response contains Pokémon data when Pokémon exists", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
  pm.expect(jsonData).to.have.property("pokemon");
  pm.expect(jsonData.pokemon).to.have.property("name");
});

// Pokemon doesn't exists. 400
// get request: http://127.0.0.1:8000/pokemon?name=faker
pm.test("Response code is 400", function () {
  pm.response.to.have.status(400);
});

pm.test("Response indicates pokemon doesn't exists", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("success", false);
  pm.expect(jsonData).to.have.property("message", "Pokemon doesn't exist");
});

// Endpoint doesn't exists.
// get request: http://127.0.0.1:8000/poke
pm.test("Response code is 500", function () {
  pm.response.to.have.status(500);
});

pm.test("Response indicates pokemon doesn't exists", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("success", false);
  pm.expect(jsonData).to.have.property(
    "message",
    "Endpoint is not implemented.",
  );
});
