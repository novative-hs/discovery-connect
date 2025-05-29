import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Eye } from "@svg/index";
import {
  add_cart_product,
  initialOrderQuantity,
} from "src/redux/features/cartSlice";
import { setProduct } from "src/redux/features/productSlice";

const SingleProduct = ({ product }) => {
  const { id, image_url, diseasename, quantity, quantity_allocated } = product || {};
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [volumeOptions, setVolumeOptions] = useState([]);
  const [selectedVolume, setSelectedVolume] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap").then((bootstrap) => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
      });
    }
  }, []);

const fetchVolumeOptions = async (diseaseName) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getVolumnUnits/${diseaseName}`;
    console.log("Fetching volume options from URL:", url);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (data.data) {
      const options = data.data
        .filter(item => {
          const hasVolume = item.volume !== null && item.volume !== "" && item.volume !== undefined;
          const hasUnit = item.QuantityUnit !== null && item.QuantityUnit !== "" && item.QuantityUnit !== undefined;
          return hasVolume || hasUnit;
        })
        .map(item => ({
          vol: item.volume,
          unit: item.QuantityUnit
        }));

      // ✅ Remove duplicates (same vol & unit)
      const uniqueOptions = options.filter((opt, index, self) =>
        index === self.findIndex(o => o.vol === opt.vol && o.unit === opt.unit)
      );

      setVolumeOptions(uniqueOptions);
    } else {
      console.error("No data in API response");
    }
  } catch (err) {
    console.error("API Error:", err);
  }
};



  const handleAddToCart = async (product) => {
    setSelectedProduct(product);
    setShowVolumeModal(true);
    await fetchVolumeOptions(product.diseasename);
  };

  const cartItems = useSelector((state) => state.cart?.cart_products || []);
  const isInCart = (sampleId) => cartItems.some((item) => item.id === sampleId);

  const handleQuickView = (prd) => {
    dispatch(initialOrderQuantity());
    dispatch(setProduct(prd));
  };

  return (
    <React.Fragment>
      <div className="product__item p-relative transition-3 mb-50 shadow rounded border bg-white overflow-hidden" style={{ transition: '0.3s ease', padding: '1rem' }}>
        <div className="product__thumb w-img p-relative mb-3 rounded overflow-hidden">
           <Image
            src={product.imageUrl}
            alt="product image"
            width={960}
            height={1125}
            style={{ objectFit: 'cover', width: '100%', height: '250px', borderRadius: '12px' }}
          />
        </div>

        <h5 className="mb-2 fw-bold text-dark">{diseasename}</h5>

        <div className="d-flex justify-content-between text-muted small mb-1">
          <span>Stock: <strong>{quantity}</strong></span>
        </div>

        <div className="text-muted small mb-3">
          Allocated: <strong>{quantity_allocated ?? 0}</strong>
        </div>

        <div className="d-flex gap-2">
          {quantity === 0 ? (
            <button className="btn w-75" disabled style={{ backgroundColor: "black", color: "white" }}>
              Sample Allocated
            </button>
          ) : isInCart(id) ? (
            <button className="btn btn-secondary w-75" disabled>
              Added
            </button>
          ) : (
            <button className="btn btn-danger w-75" onClick={() => handleAddToCart(product)}>
              Add to Cart
            </button>
          )}

          <button
            onClick={() => handleQuickView(product)}
            className="btn btn-outline-danger w-25"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Quick View"
          >
            <Eye />
          </button>
        </div>
      </div>

    {showVolumeModal && (
  <div
    className="custom-modal-overlay"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1050,
    }}
  >
    <div
      className="custom-modal"
      style={{
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "500px",
      }}
    >
      <div className="modal-header">
        <h5 className="modal-title">
          Select Volume for {selectedProduct?.diseasename}
        </h5>
        <button
          type="button"
          onClick={() => setShowVolumeModal(false)}
          style={{ background: "none", border: "none", fontSize: "1.5rem" }}
        >
          &times;
        </button>
      </div>
      <div className="modal-body mt-3">
        <select
          className="form-control"
          value={selectedVolume}
          onChange={(e) => setSelectedVolume(e.target.value)}
        >
          <option value="" hidden>Select Volume</option>
         {volumeOptions.map((v, idx) => (
  <option key={idx} value={`${v.vol}-${v.unit}`}>
    {v.vol} {v.unit}
  </option>
))}

        </select>
      </div>
      <div className="modal-footer mt-4 d-flex justify-content-end gap-2">
        <button className="btn btn-secondary" onClick={() => setShowVolumeModal(false)}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            const [vol, unit] = selectedVolume.split("-");
            dispatch(add_cart_product({ ...selectedProduct, vol, unit }));
            setShowVolumeModal(false);
          }}
          disabled={!selectedVolume}
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
)}


    </React.Fragment>
  );
};

export default SingleProduct;
