import React from "react";

const CartSidebar = ({ isCartOpen, setIsCartOpen, pendingQuotes = [] }) => {
  return (
    <>
      <div
        className={`cartmini__area ${isCartOpen ? "cartmini-opened" : ""}`}
        style={{
          width: "350px",
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          backgroundColor: "#fff",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.1)",
          zIndex: 1050,
          transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <div className="d-flex flex-column h-100">
          {/* Header */}
          <div
            className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <h5 className="mb-0 text-primary">🔔 Price Requests</h5>
            <button
              className="btn btn-sm btn-light"
              onClick={() => setIsCartOpen(false)}
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Body */}
          <div className="flex-grow-1 overflow-auto p-3">
            {pendingQuotes.length > 0 ? (
              <>
                <p className="text-muted mb-2">
                  You have <strong>{pendingQuotes.length}</strong> pending sample
                  {pendingQuotes.length > 1 ? "s" : ""}.
                </p>
                <ul className="list-group">
                  {pendingQuotes.map((item, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-start"
                    >
                      <div>
                        <div><strong>Specimen:</strong> {item.masterID}</div>
                        <div><strong>Analyte:</strong> {item.analyte}</div>
                        <small className="text-muted">Price: {item.status}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="text-muted text-center mt-4">
                No pending price requests.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-top">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => setIsCartOpen(false)}
            >
              Close Panel
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          className="body-overlay"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 1040,
          }}
        ></div>
      )}
    </>
  );
};

export default CartSidebar;
