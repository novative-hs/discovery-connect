import { useState, useCallback, useRef } from "react";
import { useClickAway } from "react-use";

const NiceSelect = ({ options, defaultCurrent = 0, placeholder = "Select", className = "", onChange, name }) => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(options[defaultCurrent]);
  const ref = useRef(null);

  const onClose = useCallback(() => setOpen(false), []);
  useClickAway(ref, onClose);

  const handleSelect = (item) => {
    setCurrent(item);
    onChange(item, name);
    setOpen(false);
  };

  return (
    <div className={`dropdown ${className}`} ref={ref}>
      <button
        className="btn btn-light border d-flex justify-content-between align-items-center rounded w-100"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{ minWidth: "200px", padding: "6px 12px" }}
      >
        <span>{current?.text || placeholder}</span>
        <i className={`ms-2 fa fa-chevron-${open ? "up" : "down"}`}></i>
      </button>

      <ul
        className={`dropdown-menu shadow-sm w-100 mt-1 ${open ? "show" : ""}`}
        style={{ maxHeight: "250px", overflowY: "auto", zIndex: 1000 }}
      >
        {options?.map((item) => (
          <li key={item.value}>
            <button
              className={`dropdown-item text-dark ${item.value === current?.value ? "active" : ""}`}
              onClick={() => handleSelect(item)}
              style={{
                fontWeight: item.value === current?.value ? "600" : "normal",
                backgroundColor: item.value === current?.value ? "#e9ecef" : "",
              }}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NiceSelect;
