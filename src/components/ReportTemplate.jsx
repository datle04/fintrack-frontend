import React from "react";
import formatDateToString from "../utils/formatDateToString";
import { formatCurrency } from "../utils/formatCurrency";
import { useTranslation } from "react-i18next";

const ReportTemplate = ({ month, year, data }) => {
  const { t, i18n } = useTranslation();
  const { user, reportId, summary, transactions, pieChartUrl, heatmapUrl } =
    data;

  return (
    <div className="p-8 text-sm text-gray-800 font-roboto">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-8">
                BÁO CÁO TÀI CHÍNH THÁNG {month}/{year}     
      </h1>
      <section className="flex justify-between gap-8 mb-6 no-break">
        <div className="w-1/2 p-4 border rounded-lg shadow-sm">
                   
          <h2 className="text-lg font-bold mb-3 text-blue-600 border-b pb-2">
            Thông tin người dùng          
          </h2>
          <div className="flex flex-col gap-2">
            <p>
              <strong>Họ tên:</strong> {user.name}
            </p>

            <p>
              <strong>Địa chỉ:</strong> {user.address}
            </p>
            <p>
              <strong>Điện thoại:</strong> {user.phone}
            </p>
            <p>
              <strong>Ngày sinh:</strong> {user.dob}
            </p>
          </div>
        </div>
        {/* Box Tổng quan */}       
        <div className="w-1/2 p-4 border rounded-lg shadow-sm">
                   
          <h2 className="text-lg font-bold mb-3 text-blue-600 border-b pb-2">
            Tổng quan          
          </h2>
                   
          <div className="flex flex-col gap-2">
                       
            <p>
              <strong>Tổng thu:</strong>{" "}
              {formatCurrency(
                summary.income,
                summary.dashboardCurrency,
                i18n.language
              )}
            </p>
                       
            <p>
              <strong>Tổng chi:</strong>{" "}
              {formatCurrency(
                summary.expense,
                summary.dashboardCurrency,
                i18n.language
              )}
            </p>
                       
            <p>
              <strong>Chênh lệch:</strong>{" "}
              {formatCurrency(
                summary.diff,
                summary.dashboardCurrency,
                i18n.language
              )}
            </p>
                       
            <p>
              <strong>Ngân sách:</strong>{" "}
              {formatCurrency(
                summary.budget,
                summary.budgetCurrency,
                i18n.language
              )}
            </p>
                     
          </div>
        </div>
             
      </section>
            {/* Bảng giao dịch */}     
      <section className="mb-6 no-break">
               
        <h2 className="text-lg font-bold mb-3 text-blue-600">
          Giao dịch trong tháng
        </h2>
               
        <table className="w-full border-collapse text-xs">
                   
          <thead>
                       
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border-b">Ngày</th>             
              <th className="p-2 border-b">Danh mục</th>             
              <th className="p-2 border-b">Mô tả</th>             
              <th className="p-2 border-b">Số tiền</th>             
              <th className="p-2 border-b">Loại</th>           
            </tr>
                     
          </thead>
                   
          <tbody>
                       
            {transactions.map((tx, index) => (
              <tr key={index} className="text-left even:bg-gray-50">
                               
                <td className="p-2 border-b border-gray-200">
                  {formatDateToString(tx.date)}           
                </td>
                               
                <td className="p-2 border-b border-gray-200">
                  {tx.category}               
                </td>
                               
                <td className="p-2 border-b border-gray-200">{tx.note}</td>     
                         
                <td className="p-2 border-b border-gray-200">
                  {formatCurrency(tx.amount, tx.currency, i18n.language)}      
                         
                </td>
                               
                <td className="p-2 border-b border-gray-200">
                  {tx.type === "income" ? "Thu" : "Chi"}               
                </td>
                             
              </tr>
            ))}
                     
          </tbody>
                 
        </table>
             
      </section>
            {/* Biểu đồ */}     
      <section className="mb-4 text-center no-break">
               
        <h2 className="text-lg font-bold mb-4 text-blue-600">
          Thống kê theo danh mục
        </h2>
               
        {pieChartUrl ? (
          <img
            src={pieChartUrl}
            alt="Biểu đồ danh mục"
            className="inline-block w-[80%] h-auto border object-contain rounded-lg shadow-sm"
          />
        ) : (
          <div className="text-center text-gray-500 p-8 border rounded-lg shadow-sm">
                       
            <p>
              Không có dữ liệu chi tiêu trong tháng {month}/{year} để vẽ biểu
              đồ.
            </p>
                     
          </div>
        )}
               
        <p className="text-xs text-gray-500 mt-2">
                    Nguồn dữ liệu từ các giao dịch trong tháng        
        </p>
             
      </section>
    </div>
  );
};

export default ReportTemplate;
