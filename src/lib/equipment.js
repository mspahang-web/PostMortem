export function getEquipmentAmount(item) {
  const quantity = Number(item?.kuantiti)
  const unitPrice = Number(item?.anggaran_harga_seunit)

  return (
    (Number.isFinite(quantity) ? quantity : 0) *
    (Number.isFinite(unitPrice) ? unitPrice : 0)
  )
}
