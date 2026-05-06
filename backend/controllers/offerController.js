const Offer = require('../models/Offer');

const getShopOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ shopkeeperId: req.params.shopId, isActive: true });
    res.json(offers);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createOffer = async (req, res) => {
  try {
    const { title, discountPercentage, expiryDate, bannerImage } = req.body;
    const offer = new Offer({
      shopkeeperId: req.user.id,
      title, discountPercentage, expiryDate, bannerImage
    });
    const createdOffer = await offer.save();
    res.status(201).json(createdOffer);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    
    if (offer.shopkeeperId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this offer' });
    }
    
    await offer.deleteOne();
    res.json({ message: 'Offer removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getShopOffers, createOffer, deleteOffer };
