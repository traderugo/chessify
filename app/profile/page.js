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
  const supabase = createClient();

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
  <div className="min-h-screen bg-gray-50 dark:bg-black px-4 py-6">
    <div className="max-w-6xl mx-auto space-y-6">

      {/* PROFILE HERO CARD */}
      <div className="bg-white dark:bg-[#161b22] rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <User className="w-14 h-14 text-white" />
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {profile?.full_name || "Your Profile"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {profile?.email}
          </p>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full
                         bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md transition"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* BASIC INFO CARD */}
        <div className="bg-white dark:bg-[#161b22] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Personal Information
          </h2>

          {/* Location */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Location</span>
            </div>

            {editing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-black
                           border border-gray-300 dark:border-gray-700
                           focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="City, Country"
              />
            ) : (
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {profile?.location || "Not specified"}
              </span>
            )}
          </div>

          {/* DOB */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Date of Birth
              </span>
            </div>

            {editing ? (
              <input
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-black
                           border border-gray-300 dark:border-gray-700
                           focus:ring-2 focus:ring-blue-500 text-right"
              />
            ) : (
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {profile?.dob
                  ? new Date(profile.dob).toLocaleDateString()
                  : "Not specified"}
              </span>
            )}
          </div>
        </div>

        {/* CHESS.COM CARD */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-7 h-7 text-yellow-300" />
            <h2 className="text-xl font-semibold">Chess.com Integration</h2>
          </div>

          {profile?.chess_com_username ? (
            <div className="space-y-3">
              <p className="text-white/80">Connected account</p>
              <p className="text-3xl font-bold">
                @{profile.chess_com_username}
              </p>
              <p className="text-white/70">
                Ratings & stats will sync automatically
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-white/80">
                Link your Chess.com account to sync ratings and stats
              </p>
              <ChessComLinkButton onLink={handleLinkChessCom} />
            </div>
          )}
        </div>
      </div>

      {/* EDIT ACTIONS */}
      {editing && (
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={handleCancel}
            className="px-8 py-3 rounded-full border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-[#161b22]
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition
                       flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="px-8 py-3 rounded-full bg-blue-500 hover:bg-blue-600
                       text-white shadow-md transition flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            {saveStatus === "saving" ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* STATUS */}
      {saveStatus === "success" && (
        <p className="text-center text-green-600 dark:text-green-400 font-medium">
          Profile updated successfully!
        </p>
      )}
      {error && (
        <p className="text-center text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  </div>
);
}