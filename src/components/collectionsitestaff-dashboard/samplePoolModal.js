import React from "react";
import InputMask from "react-input-mask";

const SamplePoolModal = ({
    mode,
    show,
    onClose,
    onSubmit,
    formData,
    setFormData,
    analyteOptions,
    selectedOption,
    filteredAnalytes ,
    selectedSampleTypeMatrixes,
    containertypeNames,
    volumeunitNames,
    unitMaxValues,
    logoHandler,
    logoPreview,
    handleInputChange,
    handleSubmit,
    handleUpdate,
    setMode,
    setshowOptionModal,
}) => {
    if (!show) return null; // Hide modal if not active

    const isEdit = mode === "edit";
    const isAdd = mode === "add";

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop fade show"
                style={{ backdropFilter: "blur(5px)" }}
            ></div>

            {/* Modal */}
            <div
                className="modal show d-block"
                tabIndex="-1"
                role="dialog"
                style={{
                    zIndex: 1050,
                    position: "fixed",
                    top: "-30px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "100%",
                    transition: "top 0.3s ease-in-out",
                }}
            >
                <div className="modal-dialog" role="document" style={{ width: "100%" }}>
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header" style={{ backgroundColor: "#cfe2ff" }}>
                            <h5 className="modal-title">{isAdd ? "Add Sample" : "Edit Sample"}</h5>
                            <button
                                type="button"
                                className="close"
                                onClick={onClose}
                                style={{
                                    fontSize: "1.5rem",
                                    position: "absolute",
                                    right: "10px",
                                    top: "10px",
                                    cursor: "pointer",
                                }}
                            >
                                <span>&times;</span>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={isAdd ? handleSubmit : handleUpdate}>
                            <div className="modal-body">
                                <div className="row">

                                    {/* Show fields depending on selectedOption */}
                                    {selectedOption !== "already" ? (
                                        <>
                                            {/* ✅ Show ALL fields if selectedOption is "new" */}

                                            {/* Analyte */}
                                            <div className="form-group col-md-6">
                                                <label>
                                                    Analyte <span className="text-danger">*</span>
                                                </label>
                                                {isEdit ? (
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="Analyte"
                                                        value={formData.Analyte || ""}
                                                        disabled
                                                        style={{
                                                            height: "45px",
                                                            fontSize: "14px",
                                                            backgroundColor: "#f5f5f5",
                                                        }}
                                                    />
                                                ) : (
                                                    <select
                                                        className="form-control"
                                                        name="Analyte"
                                                        value={formData.Analyte}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                Analyte: e.target.value,
                                                            }))
                                                        }
                                                        required
                                                        style={{
                                                            height: "45px",
                                                            fontSize: "14px",
                                                            backgroundColor: !formData.Analyte ? "#fdecea" : "#fff",
                                                        }}
                                                    >
                                                        <option value="" disabled hidden>
                                                            Select Analyte
                                                        </option>
                                                        {Array.isArray(analyteOptions) &&
                                                            analyteOptions.map((analyte, index) => (
                                                                <option key={index} value={analyte.value}>
                                                                    {analyte.label || analyte.value}
                                                                </option>
                                                            ))}
                                                    </select>
                                                )}
                                            </div>

                                            {/* Location IDs */}
                                            <div className="form-group col-md-6">
                                                <label>Location (IDs)</label>
                                                <InputMask
                                                    mask="999-999-999"
                                                    maskChar={null}
                                                    value={formData.locationids}
                                                    onChange={handleInputChange}
                                                >
                                                    {(inputProps) => (
                                                        <input
                                                            {...inputProps}
                                                            type="text"
                                                            className="form-control"
                                                            name="locationids"
                                                            placeholder="000-000-000"
                                                            style={{
                                                                height: "45px",
                                                                fontSize: "14px",
                                                                backgroundColor: "#fff",
                                                            }}
                                                            title="Location ID's = Room Number, Freezer ID and Box ID"
                                                        />
                                                    )}
                                                </InputMask>
                                            </div>

                                            {/* Final Concentration */}
                                            <div className="form-group col-md-6">
                                                <label className="mb-2">
                                                    Final Concentration <span className="text-danger">*</span>
                                                </label>
                                                <div className="d-flex gap-3">
                                                    {["Low", "Medium", "High"].map((level) => (
                                                        <div key={level} className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="finalConcentration"
                                                                id={`finalConcentration-${level}`}
                                                                value={level}
                                                                checked={formData.finalConcentration === level}
                                                                onChange={(e) => {
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        finalConcentration: e.target.value,
                                                                    }));
                                                                    setMode(e.target.value);
                                                                }}
                                                                required
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor={`finalConcentration-${level}`}
                                                            >
                                                                {level}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Volume */}
                                            <div className="form-group col-md-6">
                                                <label>
                                                    Volume <span className="text-danger">*</span>
                                                </label>
                                                <div className="d-flex">
                                                    <input
                                                        type="number"
                                                        className="form-control me-2"
                                                        name="volume"
                                                        value={formData.volume}
                                                        onChange={(e) => {
                                                            const value = parseFloat(e.target.value);
                                                            if (e.target.value === "" || (value * 10) % 5 === 0) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        step="0.5"
                                                        min="0.5"
                                                        max={unitMaxValues[formData.VolumeUnit] || undefined}
                                                        required
                                                        style={{
                                                            height: "45px",
                                                            fontSize: "14px",
                                                            backgroundColor: !formData.volume ? "#fdecea" : "#fff",
                                                        }}
                                                    />
                                                    <select
                                                        className="form-control"
                                                        name="VolumeUnit"
                                                        value={formData.VolumeUnit}
                                                        onChange={handleInputChange}
                                                        required
                                                        style={{
                                                            height: "45px",
                                                            fontSize: "14px",
                                                            backgroundColor: !formData.VolumeUnit ? "#fdecea" : "#fff",
                                                        }}
                                                    >
                                                        <option value="" hidden></option>
                                                        {volumeunitNames.map((name, index) => (
                                                            <option key={index} value={name}>
                                                                {name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Validation message */}
                                                {formData.volume &&
                                                    formData.VolumeUnit &&
                                                    parseFloat(formData.volume) >
                                                    (unitMaxValues[formData.VolumeUnit] || Infinity) && (
                                                        <small className="text-danger mt-1">
                                                            Value must be less than or equal to{" "}
                                                            {unitMaxValues[formData.VolumeUnit].toLocaleString()}.
                                                        </small>
                                                    )}
                                            </div>

                                            {/* Sample Type Matrix */}
                                            <div className="form-group col-md-6">
                                                <label>
                                                    Sample Type Matrix <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className="form-control"
                                                    name="SampleTypeMatrix"
                                                    value={formData.SampleTypeMatrix || ""}
                                                    onChange={handleInputChange}
                                                    required
                                                    style={{
                                                        height: "45px",
                                                        fontSize: "14px",
                                                        backgroundColor: !formData.SampleTypeMatrix ? "#fdecea" : "#fff",
                                                    }}
                                                >
                                                    <option value="" hidden>
                                                        Select Option
                                                    </option>
                                                    {selectedSampleTypeMatrixes.includes(formData.SampleTypeMatrix)
                                                        ? null
                                                        : (
                                                            <option value={formData.SampleTypeMatrix}>
                                                                {formData.SampleTypeMatrix}
                                                            </option>
                                                        )}
                                                    {selectedSampleTypeMatrixes.map((matrix, index) => (
                                                        <option key={index} value={matrix}>
                                                            {matrix}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Container Type */}
                                            <div className="form-group col-md-6">
                                                <label>
                                                    Container Type <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className="form-control"
                                                    name="ContainerType"
                                                    value={formData.ContainerType}
                                                    onChange={handleInputChange}
                                                    required
                                                    style={{
                                                        backgroundColor: !formData.ContainerType ? "#fdecea" : "#fff",
                                                    }}
                                                >
                                                    <option value="" hidden></option>
                                                    {containertypeNames.map((name, index) => (
                                                        <option key={index} value={name}>
                                                            {name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Sample Picture */}
                                            <div className="form-group col-md-6">
                                                <label>Sample Picture</label>
                                                <div className="d-flex align-items-center">
                                                    <input
                                                        name="logo"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => logoHandler(e.target.files[0])}
                                                        className="form-control"
                                                    />
                                                    {logoPreview && (
                                                        <img
                                                            src={logoPreview}
                                                            alt="Logo Preview"
                                                            width="80"
                                                            style={{
                                                                marginLeft: "20px",
                                                                borderRadius: "5px",
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* ✅ Only Volume if selectedOption is "already" */}

                                            {/* Final Concentration */}
                                            <div className="form-group col-md-8">
                                                <label className="mb-2">
                                                    Final Concentration <span className="text-danger">*</span>
                                                </label>
                                                <div className="d-flex gap-3">
                                                    {["Low", "Medium", "High"].map((level) => (
                                                        <div key={level} className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="samplemode"
                                                                id={`samplemode-${level}`}
                                                                value={level}
                                                                checked={formData.samplemode === level}
                                                                onChange={(e) => {
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        samplemode: e.target.value,
                                                                    }));
                                                                    setMode(e.target.value);
                                                                }}
                                                                required
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor={`samplemode-${level}`}
                                                            >
                                                                {level}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Show Analyte & Volume ONLY if Final Concentration is selected */}
                                            {formData.samplemode && (
                                                <>
                                                    {/* Analyte */}
                                                    <div className="form-group col-md-6">
                                                        <label>
                                                            Analyte <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-control"
                                                            name="Analyte"
                                                            value={formData.AnalyteUniqueKey || ""}
                                                            onChange={(e) => {
                                                                const selectedAnalyte = filteredAnalytes.find(
                                                                    (sample) =>
                                                                        `${sample.Analyte}_${sample.volume}_${sample.VolumeUnit}` ===
                                                                        e.target.value
                                                                );

                                                                if (!selectedAnalyte) return;

                                                                const formattedLocationId = `${String(
                                                                    selectedAnalyte?.room_number || 0
                                                                ).padStart(3, "0")}-${String(
                                                                    selectedAnalyte?.freezer_id || 0
                                                                ).padStart(3, "0")}-${String(
                                                                    selectedAnalyte?.box_id || 0
                                                                ).padStart(3, "0")}`;

                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    Analyte: selectedAnalyte.Analyte,
                                                                    AnalyteUniqueKey: `${selectedAnalyte.Analyte}_${selectedAnalyte.volume}_${selectedAnalyte.VolumeUnit}`,
                                                                    SampleTypeMatrix:
                                                                        selectedAnalyte?.SampleTypeMatrix || prev.SampleTypeMatrix,
                                                                    ContainerType:
                                                                        selectedAnalyte?.ContainerType || prev.ContainerType,
                                                                    finalConcentration:
                                                                        selectedAnalyte?.finalConcentration ||
                                                                        prev.finalConcentration,
                                                                    locationids: formattedLocationId,
                                                                }));
                                                            }}
                                                            required
                                                        >
                                                            <option value="" disabled hidden>
                                                                Select Analyte
                                                            </option>

                                                            {filteredAnalytes.map((sample, index) => (
                                                                <option
                                                                    key={index}
                                                                    value={`${sample.Analyte}_${sample.volume}_${sample.VolumeUnit}`}
                                                                >
                                                                    {sample.Analyte}
                                                                    {sample.volume
                                                                        ? ` (${sample.volume}${sample.VolumeUnit ? " " + sample.VolumeUnit : ""
                                                                        })`
                                                                        : ""}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Volume */}
                                                    <div className="form-group col-md-6">
                                                        <label>
                                                            Volume <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="d-flex">
                                                            <input
                                                                type="number"
                                                                className="form-control me-2"
                                                                name="volume"
                                                                value={formData.volume}
                                                                onChange={(e) => {
                                                                    const value = parseFloat(e.target.value);
                                                                    if (e.target.value === "" || (value * 10) % 5 === 0) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                                step="0.5"
                                                                min="0.5"
                                                                max={unitMaxValues[formData.VolumeUnit] || undefined}
                                                                required
                                                                style={{
                                                                    height: "45px",
                                                                    fontSize: "14px",
                                                                    backgroundColor: !formData.volume ? "#fdecea" : "#fff",
                                                                }}
                                                            />
                                                            <select
                                                                className="form-control"
                                                                name="VolumeUnit"
                                                                value={formData.VolumeUnit}
                                                                onChange={handleInputChange}
                                                                required
                                                                style={{
                                                                    height: "45px",
                                                                    fontSize: "14px",
                                                                    backgroundColor: !formData.VolumeUnit ? "#fdecea" : "#fff",
                                                                }}
                                                            >
                                                                <option value="" hidden></option>
                                                                {volumeunitNames.map((name, index) => (
                                                                    <option key={index} value={name}>
                                                                        {name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Validation message */}
                                                        {formData.volume &&
                                                            formData.VolumeUnit &&
                                                            parseFloat(formData.volume) >
                                                            (unitMaxValues[formData.VolumeUnit] || Infinity) && (
                                                                <small className="text-danger mt-1">
                                                                    Value must be less than or equal to{" "}
                                                                    {unitMaxValues[formData.VolumeUnit].toLocaleString()}.
                                                                </small>
                                                            )}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>

                            </div>

                            {/* Footer */}
                            <div className="modal-footer d-flex justify-content-between align-items-center">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setshowOptionModal(true);
                                        onClose();
                                    }}
                                >
                                    Back
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isAdd ? "Save" : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SamplePoolModal;
