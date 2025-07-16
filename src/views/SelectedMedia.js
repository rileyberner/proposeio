import React, { useState } from "react";

export default function SelectedMedia() {
  const [units, setUnits] = useState([]); // Selected rows
  const [marketFilter, setMarketFilter] = useState("All");

  const inventory = [
    {
      id: "LA-01",
      market: "Los Angeles",
      location: "Abbot Kinney & Santa Clara Ave",
      timing: "Sept 1 - Oct 25",
      rate: "$10,000",
      rationale: "",
    },
    {
      id: "SF-01",
      market: "San Francisco",
      location: "Fillmore & Union",
      timing: "Sept 1 - Oct 25",
      rate: "$8,500",
      rationale: "",
    },
    {
      id: "CHI-01",
      market: "Chicago",
      location: "Fulton Market",
      timing: "Sept 1 - Oct 25",
      rate: "$7,200",
      rationale: "",
    },
  ];

  const addUnit = (unit) => {
    if (!units.some((u) => u.id === unit.id)) {
      setUnits([...units, { ...unit, selected: true }]);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...units];
    updated[index][field] = value;
    setUnits(updated);
  };

  const filteredInventory =
    marketFilter === "All"
      ? inventory
      : inventory.filter((unit) => unit.market === marketFilter);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Selected Media</h1>

      <table border="1" cellPadding="8" style={{ marginBottom: "2rem" }}>
        <thead>
          <tr>
            <th>Select</th>
            <th>Unit ID</th>
            <th>Market</th>
            <th>Location</th>
            <th>Timing</th>
            <th>Negotiated Rate</th>
            <th>Rationale</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit, i) => (
            <tr key={unit.id}>
              <td>
                <input
                  type="checkbox"
                  checked={unit.selected}
                  onChange={(e) =>
                    handleChange(i, "selected", e.target.checked)
                  }
                />
              </td>
              <td>{unit.id}</td>
              <td>{unit.market}</td>
              <td>{unit.location}</td>
              <td>
                <input
                  value={unit.timing}
                  onChange={(e) => handleChange(i, "timing", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={unit.rate}
                  onChange={(e) => handleChange(i, "rate", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={unit.rationale}
                  onChange={(e) =>
                    handleChange(i, "rationale", e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add Media From Inventory</h2>

      <label>
        Filter by Market:{" "}
        <select
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
        >
          <option>All</option>
          <option>Los Angeles</option>
          <option>San Francisco</option>
          <option>Chicago</option>
        </select>
      </label>

      <table border="1" cellPadding="8" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Action</th>
            <th>Unit ID</th>
            <th>Market</th>
            <th>Location</th>
            <th>Timing</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.map((unit) => (
            <tr key={unit.id}>
              <td>
                <button onClick={() => addUnit(unit)}>+</button>
              </td>
              <td>{unit.id}</td>
              <td>{unit.market}</td>
              <td>{unit.location}</td>
              <td>{unit.timing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
