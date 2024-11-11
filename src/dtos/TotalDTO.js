class TotalDTO {
  constructor(
    totalQuantity,
    totalAmount,
    promotionDiscount,
    membershipDiscount,
    finalAmount,
  ) {
    this.totalQuantity = totalQuantity;
    this.totalAmount = totalAmount;
    this.promotionDiscount = promotionDiscount;
    this.membershipDiscount = membershipDiscount;
    this.finalAmount = finalAmount;
  }

  getTotalQuantity() {
    return this.totalQuantity;
  }

  getTotalAmount() {
    return this.totalAmount;
  }

  getPromotionDiscount() {
    return this.promotionDiscount;
  }

  getMembershipDiscount() {
    return this.membershipDiscount;
  }

  getFinalAmount() {
    return this.finalAmount;
  }
}

export default TotalDTO;
