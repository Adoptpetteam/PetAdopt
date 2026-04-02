import { useState, useEffect } from "react";
import { adoptionApi, type AdoptionRequest } from "../../api/adoptionApi";
import { Modal, message } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

const { confirm } = Modal;

const AdoptionManagement = () => {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await adoptionApi.list({
        status: statusFilter || undefined,
        page: currentPage,
        limit: 10,
      });
      setRequests(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, currentPage]);

  const handleViewDetail = (request: AdoptionRequest) => {
    setSelectedRequest(request);
    setAdminNote(request.adminNote || "");
    setModalVisible(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    confirm({
      title: "Duyệt đơn nhận nuôi?",
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p>Bạn đồng ý cho <strong>{selectedRequest.fullName}</strong> nhận nuôi?</p>
          <textarea
            className="w-full mt-2 p-2 border rounded"
            rows={3}
            placeholder="Ghi chú của admin (không bắt buộc)"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </div>
      ),
      onOk: async () => {
        setProcessing(true);
        try {
          await adoptionApi.approve(selectedRequest._id, adminNote);
          message.success("Đã duyệt đơn nhận nuôi!");
          setModalVisible(false);
          fetchRequests();
        } catch (error: any) {
          message.error(error?.response?.data?.message || "Có lỗi xảy ra!");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    confirm({
      title: "Từ chối đơn nhận nuôi?",
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p>Bạn muốn từ chối đơn của <strong>{selectedRequest.fullName}</strong>?</p>
          <textarea
            className="w-full mt-2 p-2 border rounded"
            rows={3}
            placeholder="Lý do từ chối (khuyến khích)"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </div>
      ),
      onOk: async () => {
        setProcessing(true);
        try {
          await adoptionApi.reject(selectedRequest._id, adminNote);
          message.success("Đã từ chối đơn!");
          setModalVisible(false);
          fetchRequests();
        } catch (error: any) {
          message.error(error?.response?.data?.message || "Có lỗi xảy ra!");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; bg: string; label: string }> = {
      pending: { color: "text-yellow-600", bg: "bg-yellow-100", label: "Chờ duyệt" },
      approved: { color: "text-green-600", bg: "bg-green-100", label: "Đã duyệt" },
      rejected: { color: "text-red-600", bg: "bg-red-100", label: "Từ chối" },
      cancelled: { color: "text-gray-600", bg: "bg-gray-100", label: "Đã hủy" },
    };
    const s = statusMap[status] || { color: "text-gray-600", bg: "bg-gray-100", label: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
        {s.label}
      </span>
    );
  };

  const getExperienceLabel = (exp: string) => {
    const map: Record<string, string> = {
      none: "Chưa có",
      beginner: "Ít kinh nghiệm",
      intermediate: "Có kinh nghiệm",
      expert: "Nhiều kinh nghiệm",
    };
    return map[exp] || exp;
  };

  const getIncomeLabel = (income: string) => {
    const map: Record<string, string> = {
      under_5m: "Dưới 5 triệu",
      "5m_10m": "5 - 10 triệu",
      "10m_20m": "10 - 20 triệu",
      over_20m: "Trên 20 triệu",
    };
    return map[income] || income;
  };

  return (
    <div className="p-6">
      <style>{`
        .adoption-table {
          width: 100%;
          border-collapse: collapse;
        }
        .adoption-table th,
        .adoption-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #f0f0f0;
        }
        .adoption-table th {
          background: #fafafa;
          font-weight: 600;
          color: #333;
        }
        .adoption-table tr:hover td {
          background: #f5f5f5;
        }
        .btn-approve {
          background: #52c41a;
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-approve:hover {
          background: #73d13d;
        }
        .btn-reject {
          background: #ff4d4f;
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-reject:hover {
          background: #ff7875;
        }
        .btn-view {
          background: #6272B6;
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-view:hover {
          background: #4a5ab3;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý đơn nhận nuôi</h2>
          <p className="text-gray-500 text-sm mt-1">Xem và duyệt đơn đăng ký nhận nuôi thú cưng</p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#6272B6]"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Đang tải...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Không có đơn nào</div>
        ) : (
          <>
            <table className="adoption-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Người đăng ký</th>
                  <th>Thú cưng</th>
                  <th>Liên hệ</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => (
                  <tr key={req._id}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                    <td>
                      <div className="font-medium">{req.fullName}</div>
                      <div className="text-sm text-gray-500">
                        {req.housingType === 'apartment' ? 'Căn hộ' :
                         req.housingType === 'house' ? 'Nhà riêng' :
                         req.housingType === 'farm' ? 'Farm' : 'Khác'}
                        {req.hasYard && ' • Có sân'}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {req.pet?.images?.[0] && (
                          <img
                            src={req.pet.images[0]}
                            alt={req.pet.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{req.pet?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-400">{req.pet?.species}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{req.phone}</div>
                      <div className="text-xs text-gray-400">{req.address}</div>
                    </td>
                    <td className="text-sm">
                      {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn-view"
                          onClick={() => handleViewDetail(req)}
                        >
                          Chi tiết
                        </button>
                        {req.status === 'pending' && (
                          <>
                            <button
                              className="btn-approve"
                              onClick={() => {
                                setSelectedRequest(req);
                                setAdminNote("");
                                handleApprove();
                              }}
                            >
                              Duyệt
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => {
                                setSelectedRequest(req);
                                setAdminNote("");
                                handleReject();
                              }}
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-4 border-t">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Trước
                </button>
                <span className="px-4 py-2">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đơn nhận nuôi"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={
          selectedRequest?.status === 'pending' ? (
            <div className="flex justify-between">
              <button
                onClick={handleReject}
                disabled={processing}
                className="btn-reject"
              >
                Từ chối
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="btn-approve"
              >
                Duyệt đơn
              </button>
            </div>
          ) : (
            <button onClick={() => setModalVisible(false)} className="btn-view">
              Đóng
            </button>
          )
        }
        width={700}
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* Pet info */}
            {selectedRequest.pet && (
              <div className="bg-gray-50 p-4 rounded-lg flex gap-4">
                {selectedRequest.pet.images?.[0] && (
                  <img
                    src={selectedRequest.pet.images[0]}
                    alt={selectedRequest.pet.name}
                    className="w-20 h-20 rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-lg">{selectedRequest.pet.name}</p>
                  <p className="text-gray-500 text-sm">{selectedRequest.pet.species}</p>
                </div>
              </div>
            )}

            {/* Personal info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Họ tên</p>
                <p className="font-medium">{selectedRequest.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-medium">{selectedRequest.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="font-medium">{selectedRequest.address}</p>
              </div>
            </div>

            {/* Reason */}
            <div>
              <p className="text-sm text-gray-500">Lý do muốn nhận nuôi</p>
              <p className="bg-yellow-50 p-3 rounded mt-1">{selectedRequest.reason}</p>
            </div>

            {/* Experience & Income */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Kinh nghiệm nuôi thú</p>
                <p className="font-medium">{getExperienceLabel(selectedRequest.experience)}</p>
                {selectedRequest.experienceDetails && (
                  <p className="text-sm text-gray-400 mt-1">{selectedRequest.experienceDetails}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Thu nhập hàng tháng</p>
                <p className="font-medium">{getIncomeLabel(selectedRequest.monthlyIncome)}</p>
              </div>
            </div>

            {/* Living conditions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Loại nhà ở</p>
                <p className="font-medium">
                  {selectedRequest.housingType === 'apartment' ? 'Căn hộ chung cư' :
                   selectedRequest.housingType === 'house' ? 'Nhà riêng có sân' :
                   selectedRequest.housingType === 'farm' ? 'Nhà vườn / Farm' : 'Khác'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sân vườn</p>
                <p className="font-medium">{selectedRequest.hasYard ? "Có" : "Không"}</p>
              </div>
            </div>

            {/* Family */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Số thành viên gia đình</p>
                <p className="font-medium">{selectedRequest.familyMembers} người</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Có trẻ nhỏ</p>
                <p className="font-medium">
                  {selectedRequest.hasChildren ? `Có${selectedRequest.childrenAges ? ` (${selectedRequest.childrenAges})` : ''}` : "Không"}
                </p>
              </div>
            </div>

            {/* Other pets */}
            <div>
              <p className="text-sm text-gray-500">Thú cưng khác</p>
              <p className="font-medium">
                {selectedRequest.hasOtherPets
                  ? selectedRequest.otherPetsDetails || "Có"
                  : "Không"}
              </p>
            </div>

            {/* Admin note */}
            {selectedRequest.adminNote && (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-500">Ghi chú admin</p>
                <p className="font-medium">{selectedRequest.adminNote}</p>
              </div>
            )}

            {/* Admin note input */}
            {selectedRequest.status === 'pending' && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Ghi chú (tùy chọn)</p>
                <textarea
                  className="w-full border border-gray-300 rounded p-2"
                  rows={2}
                  placeholder="Nhập ghi chú..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdoptionManagement;
