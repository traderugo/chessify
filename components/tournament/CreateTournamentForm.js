'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'

export default function TournamentForm({ action, initialData = {} }) {
  const { pending } = useFormStatus()
  const [serverError, setServerError] = useState(null)

  async function handleAction(formData) {
    setServerError(null)
    const result = await action(formData)
    if (result?.error) {
      setServerError(result.error)
    }
  }

  return (
    <form action={handleAction} className="space-y-6 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tournament Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          defaultValue={initialData.title || ''}
          placeholder="Lagos Rapid Chess Championship 2026"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description / Rules
        </label>
        <textarea
          name="description"
          rows={5}
          defaultValue={initialData.description || ''}
          placeholder="5 rounds Swiss, time control 15+10, tiebreaks: Buchholz → Sonneborn-Berger..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[120px]"
        />
      </div>

      {/* Entry Fee & Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entry Fee (in kobo / smallest unit)
          </label>
          <input
            name="entry_fee"
            type="number"
            min="0"
            step="100"
            defaultValue={initialData.entry_fee || 0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">e.g. 50000 = ₦500.00</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            name="currency"
            defaultValue={initialData.currency || 'NGN'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="NGN">NGN (₦)</option>
            <option value="USD">$</option>
            <option value="EUR">€</option>
          </select>
        </div>
      </div>

      {/* Max Participants & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Participants
          </label>
          <input
            name="max_participants"
            type="number"
            min="2"
            defaultValue={initialData.max_participants || ''}
            placeholder="32"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time
          </label>
          <input
            name="start_date"
            type="datetime-local"
            defaultValue={
              initialData.start_date 
                ? new Date(initialData.start_date).toISOString().slice(0,16)
                : ''
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    End Date & Time
    </label>
  <input 
    name="end_date" 
    type="datetime-local" 
    required 
    min={initialData.start_date} // Prevent end before start
    defaultValue={
      initialData.end_date 
                ? new Date(initialData.end_date).toISOString().slice(0,16)
                : ''}
  />
</div>
      </div>

      {/* Platform & External Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tournament Platform
          </label>
          <select
            name="platform"
            defaultValue={initialData.platform || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Select platform</option>
            <option value="lichess">Lichess</option>
            <option value="chesscom">Chess.com</option>
            <option value="offline">Offline / Physical</option>
            <option value="discord">Discord + custom</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            External Link (Arena / Group)
          </label>
          <input
            name="external_link"
            type="url"
            defaultValue={initialData.external_link || ''}
            placeholder="https://lichess.org/tournament/abc123"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Error */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {serverError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className={`w-full py-3 px-6 rounded-lg font-medium text-white transition
          ${pending 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
      >
        {pending ? 'Saving...' : 'Save Tournament'}
      </button>
    </form>
  )
}