import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/cartSlice';
import api from '../api';

const VoiceOrderInput = ({ lat, lng }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [matches, setMatches] = useState([]); // List of product matches
  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState('voice'); // 'voice' | 'text'

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'ml-IN';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);

      rec.onresult = async (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        await processOrder(text);
      };

      rec.onerror = (event) => {
        console.error('Speech error', event.error);
        setIsListening(false);
        toast.error('Voice recognition error. Try the text option instead.');
      };

      setRecognition(rec);
    }
  }, [lat, lng]);

  const processOrder = async (text) => {
    if (!text.trim()) return;
    setProcessing(true);
    setMatches([]);
    try {
      const response = await api.post('/voice/process', { text, lat, lng });

      if (response.data.success) {
        setMatches(response.data.matches || []);
        setQty(response.data.parsedData?.quantity || 1);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not find the product in nearby stores';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, qty: qty }));
    toast.success(`✅ ${product.name} (x${qty}) added to cart!`);
    setMatches([]);
    setTranscript('');
    setTextInput('');
  };

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Voice Recognition not supported. Use the text option.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      setMatches([]);
      recognition.start();
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setTranscript(textInput);
    await processOrder(textInput);
  };

  return (
    <div className="flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 w-full">

      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-5 w-full max-w-xs">
        <button
          onClick={() => setMode('voice')}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${mode === 'voice' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
        >
          🎤 Voice
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${mode === 'text' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
        >
          ⌨️ Type
        </button>
      </div>

      {/* Voice Mode */}
      {mode === 'voice' && (
        <>
          <button
            onClick={toggleListening}
            disabled={processing}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl transition-all duration-300 shadow-lg ${
              isListening ? 'bg-red-500 animate-pulse scale-110' : 'bg-green-500 hover:bg-green-600 hover:scale-105'
            } disabled:opacity-50`}
          >
            🎤
          </button>
          <p className="mt-3 text-gray-800 font-semibold text-base">
            {isListening ? '🔴 Listening...' : 'Tap to Speak in Malayalam'}
          </p>
          <p className="text-gray-400 text-xs mt-1">Example: "രണ്ട് കിലോ അരി"</p>
        </>
      )}

      {/* Text Mode */}
      {mode === 'text' && (
        <form onSubmit={handleTextSubmit} className="w-full flex flex-col gap-3">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type in Malayalam or English... e.g. 2 kg rice"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          <button
            type="submit"
            disabled={processing || !textInput.trim()}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 text-sm"
          >
            {processing ? 'Searching...' : '🔍 Find Lowest Price'}
          </button>
        </form>
      )}

      {/* Processing Spinner */}
      {processing && (
        <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
          <svg className="animate-spin h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Scanning nearby stores for best price...
        </div>
      )}

      {/* Transcript Display */}
      {transcript && !processing && (
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg w-full text-center border border-gray-100">
          <p className="text-xs text-gray-500">Heard: <span className="font-medium text-gray-700 italic">"{transcript}"</span></p>
        </div>
      )}

      {/* Result List */}
      {matches.length > 0 && (
        <div className="mt-5 w-full">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
            🔍 {matches.length} matches found near you:
          </p>
          <div className="space-y-3">
            {matches.map((item) => (
              <div key={item._id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 hover:border-green-300 transition group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">🏪 {item.shopkeeperId?.storeName || 'Nearby Store'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-green-700 font-bold text-sm">₹{item.sellingCost}</span>
                      <span className="text-[10px] text-gray-400">/ {item.unit}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] bg-white border border-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">
                      Qty: {qty}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition shadow-sm whitespace-nowrap"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setMatches([])}
            className="w-full mt-4 text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear results
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceOrderInput;
