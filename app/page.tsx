'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Reservation = {
  id: string
  reservation_date: string
  start_time: string
  category: string
  status: string
  note: string
  patients: {
    name_last: string
    name_first: string
    phone: string
  }
}

export default function Home() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    fetchReservations()
  }, [selectedDate])

  async function fetchReservations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        patients (
          name_last,
          name_first,
          phone
        )
      `)
      .eq('reservation_date', selectedDate)
      .order('start_time')

    if (error) {
      console.error('Error fetching reservations:', error)
    } else {
      setReservations(data || [])
    }
    setLoading(false)
  }

  const categoryLabels: { [key: string]: string } = {
    checkup: '定期検診',
    treatment: '治療',
    consultation: '相談',
    emergency: '急患',
    other: 'その他',
  }

  const statusLabels: { [key: string]: string } = {
    confirmed: '予約確定',
    checked_in: '来院済',
    in_progress: '診察中',
    completed: '完了',
    cancelled: 'キャンセル',
    no_show: '無断キャンセル',
  }

  const statusColors: { [key: string]: string } = {
    confirmed: 'bg-blue-100 text-blue-800',
    checked_in: 'bg-green-100 text-green-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      {/* 日付選択とボタン */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">日付：</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-gray-700"
          />
        </div>
        <Link
          href="/reservations/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ＋ 新規予約
        </Link>
      </div>

      {/* 予約一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            予約一覧 - {selectedDate}
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">読み込み中...</div>
        ) : reservations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            この日の予約はありません
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  患者名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  電話番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  種別
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  備考
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reservation.start_time?.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservation.patients?.name_last} {reservation.patients?.name_first}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.patients?.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {categoryLabels[reservation.category] || reservation.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[reservation.status] || 'bg-gray-100'
                      }`}
                    >
                      {statusLabels[reservation.status] || reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {reservation.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
