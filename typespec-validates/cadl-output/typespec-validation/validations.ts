type Account = any;
function validateAccount(type: Account) {
  if (!(type.closed_date === null || type.closed_date > type.creation_date)) {
    throw new Error("creation date must be after closed date");
  }
  if (!(type.owner.age >= 18)) {
    throw new Error("Owner must be an adult");
  }
  if (!(type.state === "pending" || type.hasOwnProperty("id"))) {
    throw new Error("Accounts that aren't pending have an account id");
  }
  if (!(type.balance >= 0)) {
    throw new Error("Balance must be greater than zero");
  }
}
type Person = any;
function validatePerson(type: Person) {
  if (!(!type.hasOwnProperty("address") || type.accounts.length === 0)) {
    throw new Error("must have an address to have an account");
  }
  if (!(type.accounts.length < 3)) {
    throw new Error("A person can only have 3 accounts");
  }
}
