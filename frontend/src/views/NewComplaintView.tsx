import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleMap } from '../components/GoogleMap';
import { PriorityBadge } from '../components/PriorityBadge';
import { AIAnalysisResult, DuplicateMatch } from '../types';
import { 
  Mic, MicOff, Volume2, Sparkles, MapPin, 
  Upload, Shield, AlertTriangle, CheckCircle, 
  ArrowRight, ArrowLeft, Layers, Info, CheckCircle2, RotateCcw
} from 'lucide-react';

interface NewComplaintViewProps {
  onSuccess: (complaintId: string) => void;
  onCancel: () => void;
}

export const NewComplaintView: React.FC<NewComplaintViewProps> = ({ onSuccess, onCancel }) => {
  const { user, token } = useAuth();

  // Wizard Step: 1 = Form Input, 2 = AI Live Analysis & Duplicate Review
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('auto');
  const [locality, setLocality] = useState(user?.locality || 'Civil Lines, Delhi');
  const [landmark, setLandmark] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [locationMethod, setLocationMethod] = useState<'gps' | 'manual_search' | 'map_pin'>('map_pin');
  const [lat, setLat] = useState<number>(28.6750);
  const [lon, setLon] = useState<number>(77.2250);
  const [privacyMode, setPrivacyMode] = useState<'public' | 'private' | 'confidential'>('public');
  const [imageUrl, setImageUrl] = useState<string>('');

  // Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [activeVoicePreset, setActiveVoicePreset] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // AI Live Analysis Result State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories list
  const categories = [
    { id: 'auto', label: '✨ AI Auto-Categorize' },
    { id: 'Potholes and damaged roads', label: 'Potholes & Damaged Roads' },
    { id: 'Garbage and sanitation', label: 'Garbage & Public Sanitation' },
    { id: 'Water leakage', label: 'Water Leakage' },
    { id: 'Water supply problems', label: 'Water Supply & Contamination' },
    { id: 'Drainage and waterlogging', label: 'Drainage & Waterlogging' },
    { id: 'Streetlight faults', label: 'Streetlight Faults' },
    { id: 'Public infrastructure damage', label: 'Public Infrastructure Damage' },
    { id: 'Electricity hazards', label: 'Electricity Hazards' },
    { id: 'Other civic issues', label: 'Other Civic Grievance' },
  ];

  // Handle Preset Voice Samples
  const handleVoicePreset = async (presetKey: string) => {
    setActiveVoicePreset(presetKey);
    setVoiceNotice("Loading speech transcription from CivicSaathi Multilingual Speech Core...");
    try {
      const res = await fetch('/api/admin/speech/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_key: presetKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setTitle(data.suggested_title);
        setDescription(data.editable_transcript);
        if (data.locality) setLocality(data.locality);
        if (data.landmark) setLandmark(data.landmark);
        setVoiceNotice(`Audio transcribed (${data.detected_language.toUpperCase()}): "${data.editable_transcript}"`);
      }
    } catch {
      setVoiceNotice("Speech transcription server connection failed.");
    }
  };

  // Run AI live analysis
  const runLiveAnalysis = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please provide both a title and description for your complaint.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/complaints/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          locality,
          landmark,
          selected_address: selectedAddress || undefined,
          location_selection_method: locationMethod,
          latitude: lat,
          longitude: lon,
          has_image: Boolean(imageUrl),
          has_audio: Boolean(activeVoicePreset),
        }),
      });

      if (!res.ok) {
        alert("Failed running AI analysis. Please check inputs.");
        return;
      }

      const result: AIAnalysisResult = await res.json();
      setAiResult(result);
      setStep(2);
    } catch {
      alert("Connection error running AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Final Submission
  const handleSubmitComplaint = async (joinClusterId?: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category: category === 'auto' ? aiResult?.suggested_category : category,
          locality,
          landmark,
          selected_address: selectedAddress || null,
          location_selection_method: locationMethod,
          latitude: lat,
          longitude: lon,
          privacy_mode: privacyMode,
          image_url: imageUrl || null,
          audio_transcript: voiceNotice ? description : null,
          join_cluster_id: joinClusterId || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Submission failed");
        return;
      }

      const data = await res.json();
      alert(`Complaint successfully filed! Ticket Number: ${data.ticket_number}`);
      onSuccess(data.complaint_id);
    } catch {
      alert("Network error submitting complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Wizard Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-400" />
            AI-Assisted Civic Grievance Intake
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit in Hindi or English. AI will assist with classification, explainable severity scoring, and duplicate checks.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
            Step 1: Input
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
            Step 2: AI Review
          </span>
        </div>
      </div>

      {step === 1 ? (
        /* STEP 1: FORM INPUT */
        <div className="space-y-6">
          {/* Multilingual Voice Recording Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0b1424] border border-cyan-800/60 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Multilingual Voice Input (Hindi & English)
                </span>
              </div>
              <span className="text-[11px] text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                Bilingual Speech Core
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Speak or select a real-world multilingual test recording to auto-generate title, description, and location:
            </p>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleVoicePreset('hindi_pothole')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                  activeVoicePreset === 'hindi_pothole'
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold">🇮🇳 Hindi Voice Preset: Road Pothole</div>
                  <div className="text-[10px] text-slate-400">"सिविल लाइन्स मेन रोड पर गहरा गड्ढा है..."</div>
                </div>
                <Volume2 className="w-4 h-4 text-teal-400 shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={() => handleVoicePreset('hindi_garbage')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                  activeVoicePreset === 'hindi_garbage'
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold">🇮🇳 Hindi Voice Preset: Garbage Dump</div>
                  <div className="text-[10px] text-slate-400">"मार्केट के पीछे 4 दिन से जमा कचरे का ढेर..."</div>
                </div>
                <Volume2 className="w-4 h-4 text-teal-400 shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={() => handleVoicePreset('english_water_leak')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                  activeVoicePreset === 'english_water_leak'
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold">🇬🇧 English Voice Preset: Water Leak</div>
                  <div className="text-[10px] text-slate-400">"Major pipeline burst in Green Park Ext..."</div>
                </div>
                <Volume2 className="w-4 h-4 text-teal-400 shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={() => handleVoicePreset('english_streetlight')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                  activeVoicePreset === 'english_streetlight'
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold">🇬🇧 English Voice Preset: Dark Street</div>
                  <div className="text-[10px] text-slate-400">"Non-functional streetlights on 7th Cross..."</div>
                </div>
                <Volume2 className="w-4 h-4 text-teal-400 shrink-0 ml-2" />
              </button>
            </div>

            {voiceNotice && (
              <div className="p-2.5 rounded-lg bg-teal-950/50 border border-teal-800/60 text-teal-300 text-xs flex items-center justify-between">
                <span>{voiceNotice}</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveVoicePreset(null);
                    setVoiceNotice(null);
                  }}
                  className="text-[11px] underline text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Form Fields Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Complaint Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Dangerous deep pothole on Civil Lines main arterial road"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-200">
                  Detailed Description (Editable Transcript) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Hindi, Hinglish, or English</span>
              </div>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, how long it has persisted, size, hazard to vehicles or pedestrians..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 leading-relaxed"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Civic Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Locality / Neighborhood <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Civil Lines, Delhi"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Nearby Landmark / House No.
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Station Gate 2"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Interactive Map Pin & Geolocation Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  Incident Geographic Location (GPS / Places / Map Pin)
                </label>
                <span className="text-[11px] font-mono text-teal-400 bg-teal-950/70 border border-teal-900/60 px-2 py-0.5 rounded">
                  Lat: {lat.toFixed(5)}, Lon: {lon.toFixed(5)}
                </span>
              </div>
              <GoogleMap
                mode="picker"
                center={[lat, lon]}
                zoom={15}
                selectedCoord={[lat, lon]}
                selectedAddress={selectedAddress}
                selectedLocality={locality}
                onLocationChange={(info) => {
                  setLat(info.lat);
                  setLon(info.lon);
                  if (info.address) setSelectedAddress(info.address);
                  if (info.locality) setLocality(info.locality);
                  if (info.landmark) setLandmark(info.landmark);
                  setLocationMethod(info.method);
                }}
                onResetLocation={() => {
                  setSelectedAddress('');
                  setLocationMethod('map_pin');
                }}
                height="320px"
              />
            </div>

            {/* Image Evidence Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Optional Photographic Evidence
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL or choose demo photo below"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80')}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 whitespace-nowrap"
                >
                  📷 Attach Sample Photo
                </button>
              </div>
              {imageUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={imageUrl} alt="Preview" className="w-16 h-12 object-cover rounded-lg border border-slate-700" />
                  <span className="text-[11px] text-teal-400">Photo attached successfully</span>
                </div>
              )}
            </div>

            {/* 3 Complaint Privacy Modes */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-200">
                Choose Complaint Privacy Mode <span className="text-rose-400">*</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Public */}
                <div
                  onClick={() => setPrivacyMode('public')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    privacyMode === 'public'
                      ? 'bg-teal-950/60 border-teal-500 text-teal-200 ring-1 ring-teal-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">Public Issue</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                      Community Visible
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Sanitized summary visible in Public Feed & Community Clusters. Fellow citizens can support.
                  </p>
                </div>

                {/* 2. Private */}
                <div
                  onClick={() => setPrivacyMode('private')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    privacyMode === 'private'
                      ? 'bg-teal-950/60 border-teal-500 text-teal-200 ring-1 ring-teal-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">Private Report</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                      Restricted
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Strictly confidential. Visible only to you and authorized department personnel. Excluded from public clusters.
                  </p>
                </div>

                {/* 3. Confidential Public-Interest */}
                <div
                  onClick={() => setPrivacyMode('confidential')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    privacyMode === 'confidential'
                      ? 'bg-teal-950/60 border-teal-500 text-teal-200 ring-1 ring-teal-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">Confidential Public-Interest</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                      Whistleblower
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Your identity and sensitive coordinates remain restricted. A sanitized summary is released only after moderation.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={runLiveAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <Sparkles className="w-4 h-4" />
                {isAnalyzing ? "Analyzing Complaint & Checking Duplicates..." : "Analyze with AI & Check Duplicates →"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: AI LIVE ANALYSIS & DUPLICATE REVIEW */
        aiResult && (
          <div className="space-y-6">
            {/* Top Analysis Summary Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block mb-1">
                    AI Live Assessment Results ({aiResult.detected_language})
                  </span>
                  <h2 className="text-lg font-bold text-white">{aiResult.ai_summary}</h2>
                </div>
                <PriorityBadge score={aiResult.severity_score} label={aiResult.severity_label} />
              </div>

              {/* Categorization & Routing Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Suggested Category</span>
                  <span className="font-bold text-teal-300 text-sm">{aiResult.suggested_category}</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Confidence: {(aiResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Intelligent Department Routing</span>
                  <span className="font-bold text-cyan-300 text-sm">{aiResult.suggested_department}</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Status: <strong className="text-slate-300">Department Verification Required</strong>
                  </span>
                </div>
              </div>

              {/* Location Verification Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Verified Incident Location</span>
                  <div className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{selectedAddress || `${locality}${landmark ? ', ' + landmark : ''}`}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    GPS Coordinates: {lat.toFixed(5)}, {lon.toFixed(5)}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    Fix Mode: {locationMethod.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Explainable Severity Score Formula */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    Explainable Severity Score Breakdown ({aiResult.severity_score}/100)
                  </span>
                  <span className="text-[11px] text-slate-400 italic">Prototype Heuristic Model</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Safety Risk</span>
                    <strong className="text-white text-xs">{aiResult.severity_factors.breakdown.safety_risk.score}/40</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Public Impact</span>
                    <strong className="text-white text-xs">{aiResult.severity_factors.breakdown.public_impact.score}/25</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Time Unresolved</span>
                    <strong className="text-white text-xs">{aiResult.severity_factors.breakdown.time_unresolved.score}/15</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Evidence Quality</span>
                    <strong className="text-white text-xs">{aiResult.severity_factors.breakdown.evidence_quality.score}/10</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Cluster Density</span>
                    <strong className="text-white text-xs">{aiResult.severity_factors.breakdown.cluster_density.score}/10</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  💡 <strong>Recommended Action:</strong> {aiResult.severity_factors.recommended_action}
                </p>
              </div>

              {/* Missing Information Alerts */}
              {aiResult.missing_info_warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Missing Information Recommendations
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-200/90">
                    {aiResult.missing_info_warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* SIGNATURE FEATURE: SMART DUPLICATE DETECTION WARNING */}
            {aiResult.possible_duplicates.length > 0 ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/70 via-slate-900 to-amber-950/40 border-2 border-amber-600/80 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span>Similar Public Issue Found Nearby ({aiResult.possible_duplicates.length} match)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Our TF-IDF semantic and geographic proximity engine detected existing reports matching your incident. 
                  You can <strong>join and support the existing issue cluster</strong> to amplify community urgency without creating duplicate administrative tickets!
                </p>

                {/* Candidate Duplicate Cards */}
                <div className="space-y-3">
                  {aiResult.possible_duplicates.map((dup) => (
                    <div
                      key={dup.complaint_id}
                      className="p-4 rounded-xl bg-slate-950 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono text-slate-400 font-semibold">{dup.ticket_number}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                            {(dup.similarity_score * 100).toFixed(0)}% Similarity Match
                          </span>
                          {dup.distance_meters !== null && dup.distance_meters !== undefined && (
                            <span className="text-[10px] text-cyan-300 font-mono">
                              📍 {dup.distance_meters}m away
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white">{dup.title}</h4>
                        <div className="text-[11px] text-slate-400">
                          Matching Reasons: <strong className="text-slate-300">{dup.matching_reasons.join(' • ')}</strong>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {dup.cluster_id ? (
                          <button
                            type="button"
                            onClick={() => handleSubmitComplaint(dup.cluster_id || undefined)}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            Support This Existing Issue
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No duplicate reports found within 1.5km. This report will be registered as a fresh civic issue.</span>
              </div>
            )}

            {/* Navigation & Final Submission Buttons */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit Details
              </button>

              <button
                type="button"
                onClick={() => handleSubmitComplaint()}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <CheckCircle className="w-4 h-4" />
                {isSubmitting ? "Registering Complaint..." : "Submit as Separate Distinct Complaint"}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
