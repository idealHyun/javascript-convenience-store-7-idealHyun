class PurchasedProductDTO {
  constructor(name, quantity, amount) {
    this.name = name;
    this.quantity = quantity;
    this.amount = amount;
  }

  getName() {
    return this.name;
  }

  getQuantity() {
    return this.quantity;
  }

  getAmount() {
    return this.amount;
  }
}

export default PurchasedProductDTO;