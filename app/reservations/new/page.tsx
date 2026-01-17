'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewReservation() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 患者情報
  const [nameLast, setNameLast] = useState('')
  const [nameFirst, setNameFirst] = useState('')
  const [nameLastKana, setNameLastKana] = useState('')
  const [nameFirstKana, setNameFirstKana] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('male')
  const [phone, setPhone] = useState('')
  
  // 予約情報
  const [reservationDate, setReservationDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [category, setCategory] = useState('checkup')
  const [note, setNote] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. まず患者を検索（電話番号で）
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', phone)
        .single()

      let patientId: string

      if (existingPatient) {
        // 既存の患者
        patientId = existingPatient.id
      } else {
        // 新規患者を登録
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            name_last: nameLast,
            name_first: nameFirst,
            name_last_kana: nameLastKana,
            name_first_kana: nameFirstKana,
            birth_date: birthDate,
            gender: gender,
            phone: phone,
          })
          .select('id')
          .single()

        if (patientError) throw patientError
        patientId = newPatient.id
      }

      // 2. 予約を登録
      const { error: reservationError } = await supabase
        .from('reservations')
        .insert({
          patient_id: patientId,
          reservation_date: reservationDate,
          start_time: startTime,
          category: category,
          note: note,
        })

      if (reservationError) throw reservationError

      // 成功したら一覧に戻る
      router.push('/')
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || '予約の登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← 予約一覧に戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">新規予約</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 患者情報 */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">患者情報</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameLast}
                  onChange={(e) => setNameLast(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="山田"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameFirst}
                  onChange={(e) => setNameFirst(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="太郎"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  セイ
                </label>
                <input
                  type="text"
                  value={nameLastKana}
                  onChange={(e) => setNameLastKana(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="ヤマダ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メイ
                </label>
                <input
                  type="text"
                  value={nameFirstKana}
                  onChange={(e) => setNameFirstKana(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="タロウ"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生年月日
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性別
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="090-1234-5678"
              />
              <p className="text-xs text-gray-500 mt-1">
                ※ 既存の患者様は電話番号で自動的に照合されます
              </p>
            </div>
          </div>

          {/* 予約情報 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">予約情報</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  予約日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                種別
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="checkup">定期検診</option>
                <option value="treatment">治療</option>
                <option value="consultation">相談</option>
                <option value="emergency">急患</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備考
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                placeholder="特記事項があれば入力してください"
              />
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-4">
            <Link
              href="/"
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '登録中...' : '予約を登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
