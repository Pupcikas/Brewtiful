// src/components/ExtraIngredientsModal.js
import React, { useState } from "react";
import Modal from "./Modal";

function ExtraIngredientsModal({ isOpen, onClose, item, onConfirm }) {
  const [selectedExtras, setSelectedExtras] = useState({});

  const handleQuantityChange = (ingredientId, value) => {
    setSelectedExtras((prev) => ({
      ...prev,
      [ingredientId]: Number(value),
    }));
  };

  const handleConfirm = () => {
    // Prepare the extras array with ingredient details and quantities
    const extras = item.ingredients
      .filter((ing) => selectedExtras[ing.id] > 0)
      .map((ing) => ({
        ...ing,
        quantity: selectedExtras[ing.id],
      }));
    onConfirm(extras);
    setSelectedExtras({});
  };

  const handleClose = () => {
    setSelectedExtras({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Customize ${item.name}`}
    >
      <div className="space-y-4">
        {item.ingredients.map((ing) => (
          <div key={ing.id} className="flex items-center justify-between">
            <span>
              {ing.name} (+${ing.extraCost.toFixed(2)} each)
            </span>
            <input
              type="number"
              min="0"
              value={selectedExtras[ing.id] || 0}
              onChange={(e) => handleQuantityChange(ing.id, e.target.value)}
              className="w-16 p-1 border rounded"
            />
          </div>
        ))}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ExtraIngredientsModal;
