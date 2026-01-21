"use client";

import { useState, useEffect } from "react";
import { User, Mail, MapPin, Calendar, Edit2, Check, X, Trophy, Target } from "lucide-react";
import ChessComLinkButton from "../../components/integration/ChessComLinkButton";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    dob: "",
  });
  supabase = createClient();
  
  const [saveStatus, setSaveStatus] = useState("");
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, location, dob, chess_com_username")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        fullName: data.full_name || "",
        location: data.location || "",
        dob: data.dob || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChessCom = async (username) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .update({ chess_com_username: username })
        .eq("id", user.id);

      if (error) throw error;
      fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus("saving");
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName.trim(),
          location: formData.location.trim() || null,
          dob: formData.dob || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => ({
        ...prev,
        full_name: formData.fullName.trim(),
        location: formData.location.trim(),
        dob: formData.dob,
      }));
      setEditing(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      setError(err.message);
      setSaveStatus("error");
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: profile?.full_name || "",
      location: profile?.location || "",
      dob: profile?.dob || "",
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-blue-500 text-lg font-medium">Loading profile...</div>
      </div>
    );
  }

  return (
      <div className="max-w-5xl mx-auto my-2 px-4">
        {/* Clean, modern card layout – centered, minimal, professional */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="p-8 md:p-12">
            {/* Header with avatar and name */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full shadow-lg">
                <User className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                {profile?.full_name || "Your Profile"}
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                {profile?.email}
              </p>

              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition px-6 py-3 flex items-center gap-2 mx-auto shadow-md"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Details Section */}
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 gap-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <MapPin className="w-6 h-6 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Location</span>
                    </div>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-right"
                        placeholder="City, Country"
                      />
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {profile?.location || "Not specified"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-6 h-6 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Date of Birth</span>
                    </div>
                    {editing ? (
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {profile?.dob ? new Date(profile.dob).toLocaleDateString() : "Not specified"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chess.com Integration */}
                <div className="py-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Chess.com Integration
                    </h2>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-2xl p-8 text-center">
                    {profile?.chess_com_username ? (
                      <div>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                          Successfully linked
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          @{profile.chess_com_username}
                        </p>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                          Your ratings and stats will appear in tournaments
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                          Link your Chess.com account to sync ratings and stats
                        </p>
                        <ChessComLinkButton onLink={handleLinkChessCom} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Actions */}
            {editing && (
              <div className="mt-12 flex justify-center gap-6">
                <button
                  onClick={handleCancel}
                  className="px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3 text-lg"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-70 text-white rounded-full transition flex items-center gap-3 text-lg shadow-md"
                >
                  {saveStatus === "saving" ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Status Messages */}
            {saveStatus === "success" && (
              <p className="mt-8 text-center text-green-600 dark:text-green-400 text-lg font-medium">
                Profile updated successfully!
              </p>
            )}
            {error && (
              <p className="mt-8 text-center text-red-600 dark:text-red-400 text-lg font-medium">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
  );
}