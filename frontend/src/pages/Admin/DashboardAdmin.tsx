
const DashboardAdmin = () => {

  const categories = [
    "vegetable",
    "cup",
    "meats",
    "breakfast",
    "frozen",
    "milk",
  ];

  return (
    <div className="container-fluid" style={{ padding: "20px" }}>

      {/* CSS */}
      <style>{`
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-radius: 15px !important;
          overflow: hidden;
          border: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          background: #fff;
          margin-bottom: 20px;
        }

        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .custome-1-bg { background: rgba(13, 164, 135, 0.1); }
        .custome-2-bg { background: rgba(255, 128, 139, 0.1); }
        .custome-3-bg { background: rgba(255, 186, 0, 0.1); }
        .custome-4-bg { background: rgba(74, 144, 226, 0.1); }

        .counter {
          font-weight: 700;
          color: #4a5568;
          margin-top: 10px;
        }

        .badge-light-primary { background: #0da487; color: #fff; }
        .badge-light-danger { background: #ff808b; color: #fff; }
        .badge-light-secondary { background: #ffba00; color: #fff; }
        .badge-light-success { background: #4caf50; color: #fff; }

        .static-top-widget {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-slider-mockup::-webkit-scrollbar {
          height: 6px;
        }

        .category-slider-mockup::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
      `}</style>

      <div className="row">


        {/* 2. CATEGORY */}
        <div className="col-12 mt-2">

          <div className="card-hover card">

            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h4 style={{ fontWeight: 600, color: "#2d3748" }}>
                Category
              </h4>
            </div>

            <div className="card-body p-0">

              <div
                className="category-slider-mockup"
                style={{
                  display: "flex",
                  gap: "20px",
                  padding: "20px",
                  overflowX: "auto",
                }}
              >

                {categories.map((item, index) => (

                  <div
                    key={index}
                    className="text-center"
                    style={{ minWidth: "110px" }}
                  >

                    <div
                      style={{
                        background: "#f8f9fa",
                        padding: "15px",
                        borderRadius: "12px",
                        border: "1px solid #edf2f7",
                      }}
                    >

                      <img
                        src={`/src/assets/svg/${item}.svg`}
                        className="img-fluid"
                        alt={item}
                        style={{ height: "40px" }}
                      />

                    </div>

                    <h6
                      className="mt-2"
                      style={{
                        fontSize: "13px",
                        color: "#4a5568",
                        textTransform: "capitalize",
                      }}
                    >
                      {item}
                    </h6>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardAdmin;