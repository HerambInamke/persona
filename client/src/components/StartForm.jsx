import { useState } from 'react';
import { motion } from 'framer-motion';

const StartForm = ({ onSubmit }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!name.trim()) newErrors.name = 'Driver name is required';
    if (!carNumber) newErrors.carNumber = 'Car number is required';
    if (carNumber < 1 || carNumber > 99) newErrors.carNumber = 'Number must be between 1-99';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({ 
      phone: phone.trim(), 
      name: name.trim(), 
      number: parseInt(carNumber), 
      difficulty: 'chaos' 
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-2 tracking-wider"
            style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '0.1em' }}
          >
            F1 REACTION
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-red-600"
            style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '0.15em' }}
          >
            CHAMPIONSHIP
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="h-1 bg-red-600 mt-4 mx-auto w-32"
          />
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onSubmit={handleSubmit}
          className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-8 rounded-lg border border-gray-700"
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 tracking-wide text-gray-300">
              PHONE NUMBER
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:border-red-600 text-white"
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 tracking-wide text-gray-300">
              DRIVER NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:border-red-600 text-white"
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2 tracking-wide text-gray-300">
              CAR NUMBER
            </label>
            <input
              type="number"
              value={carNumber}
              onChange={(e) => setCarNumber(e.target.value)}
              min="1"
              max="99"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:border-red-600 text-white"
              placeholder="1-99"
            />
            {errors.carNumber && <p className="text-red-500 text-sm mt-1">{errors.carNumber}</p>}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 bg-red-600 hover:bg-red-700 rounded font-bold text-lg tracking-wider transition-colors"
          >
            START CHAMPIONSHIP
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default StartForm;
