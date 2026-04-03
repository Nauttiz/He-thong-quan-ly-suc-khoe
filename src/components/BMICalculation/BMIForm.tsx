import React, { useState, useEffect } from 'react';
import { Session, Student, HealthRecord } from '../../types/interfaces';
import { calculateWHOZScore, getZScoreSimpleName } from '../../utils/whoZScoreData'; 

interface BMIFormProps {
  selectedSession: Session;
  selectedStudent: Student;
  onHealthRecordCreated: (record: Omit<HealthRecord, 'id'>) => void;
  editingRecord?: HealthRecord | null;
}

export default function BMIForm({
  selectedSession,
  selectedStudent,
  onHealthRecordCreated,
  editingRecord
}: BMIFormProps) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingRecord) {
      setHeight(editingRecord.height.toString());
      setWeight(editingRecord.weight.toString());
      setWaist(editingRecord.waist?.toString() || '');
      setSystolic(editingRecord.bloodPressure?.systolic.toString() || '');
      setDiastolic(editingRecord.bloodPressure?.diastolic.toString() || '');
      setNotes(editingRecord.notes || '');
    } else {
      setHeight('');
      setWeight('');
      setWaist('');
      setSystolic('');
      setDiastolic('');
      setNotes('');
    }
  }, [editingRecord]);

  const calculateBMI = (heightCm: number, weightKg: number): number => {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  };

  const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
    if (gender === 'male') {
      return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
    } else {
      return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log('📏 BMIForm: Starting submission...');

      const heightNum = parseFloat(height);
      const weightNum = parseFloat(weight);
      const waistNum = waist ? parseFloat(waist) : undefined;
      const systolicNum = systolic ? parseInt(systolic) : undefined;
      const diastolicNum = diastolic ? parseInt(diastolic) : undefined;

      if (!heightNum || !weightNum) {
        throw new Error('Chiều cao và cân nặng là bắt buộc');
      }

      const bmi = calculateBMI(heightNum, weightNum);
      const currentYear = new Date().getFullYear();
      const age = currentYear - selectedStudent.birthYear;
      
      // Sử dụng WHO Z-Score calculation
      const zScore = Math.round(calculateWHOZScore(bmi, age, selectedStudent.gender) * 100) / 100;
      const bmr = calculateBMR(weightNum, heightNum, age, selectedStudent.gender);

      const healthRecord = {
        sessionId: selectedSession.id,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentClass: selectedStudent.class,
        height: heightNum,
        weight: weightNum,
        bmi,
        zScore,
        bmr,
        waist: waistNum,
        bloodPressure: (systolicNum && diastolicNum) ? {
          systolic: systolicNum,
          diastolic: diastolicNum
        } : undefined,
        notes: notes.trim() || undefined,
        date: editingRecord?.date || new Date().toISOString().split('T')[0],
        createdAt: editingRecord?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🚀 BMIForm: Calling onHealthRecordCreated with:', healthRecord);
      await onHealthRecordCreated(healthRecord); // thêm await để đảm bảo hoàn thành

      console.log('✅ BMIForm: Health record saved successfully');

      // Reset form only if not editing
      if (!editingRecord) {
        setHeight('');
        setWeight('');
        setWaist('');
        setSystolic('');
        setDiastolic('');
        setNotes('');
      }

    } catch (error) {
      console.error('❌ BMIForm: Error creating health record:', error);
      alert('Có lỗi xảy ra khi lưu kết quả đo: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function that get WHO classification simple
  const getZScoreClassification = (zScore: number) => {
    const classification = getZScoreSimpleName(zScore);
    let color = 'blue';
    
    if (classification === '-3SD' || classification === '+3SD') color = 'red';
    else if (classification === '-2SD' || classification === '+2SD') color = 'orange';
    else if (classification === '-1SD' || classification === '+1SD') color = 'yellow';
    else if (classification === 'Trung bình') color = 'green';
    
    return { classification, color };
  };

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h2 className="text-xl lg:text-2xl font-bold">
          {editingRecord ? '✏️ Chỉnh sửa kết quả đo' : 'Nhập thông số đo'}
        </h2>
        {editingRecord && (
          <div className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
            Đang chỉnh sửa
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Basic Measurements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chiều cao (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              min="50"
              max="250"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Ví dụ: 150.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cân nặng (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="10"
              max="200"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Ví dụ: 45.2"
            />
          </div>
        </div>

        {/* Optional Measurements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vòng eo (cm)
            </label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="150"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Ví dụ: 70.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Huyết áp tâm thu (mmHg)
            </label>
            <input
              type="number"
              min="80"
              max="200"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Ví dụ: 120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Huyết áp tâm trương (mmHg)
            </label>
            <input
              type="number"
              min="40"
              max="120"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Ví dụ: 80"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 Ghi chú
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            placeholder="Ghi chú về tình trạng sức khỏe, khuyến nghị..."
          />
        </div>

        {/* Enhanced BMI Preview với WHO classification đơn giản */}
        {height && weight && (
          (() => {
            const bmi = calculateBMI(parseFloat(height), parseFloat(weight));
            const age = new Date().getFullYear() - selectedStudent.birthYear;
            const zScore = calculateWHOZScore(bmi, age, selectedStudent.gender);
            const { classification, color } = getZScoreClassification(zScore);
            
            return (
              <div className={`border-2 rounded-xl p-4 ${
                color === 'green' ? 'bg-green-50 border-green-200' :
                color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                color === 'orange' ? 'bg-orange-50 border-orange-200' :
                color === 'red' ? 'bg-red-50 border-red-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <h3 className={`font-medium mb-3 ${
                  color === 'green' ? 'text-green-900' :
                  color === 'yellow' ? 'text-yellow-900' :
                  color === 'orange' ? 'text-orange-900' :
                  color === 'red' ? 'text-red-900' :
                  'text-blue-900'
                }`}>
                  📊 Kết quả đánh giá (WHO 2007):
                </h3>
                
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">BMI:</span>
                    <span className="ml-2 font-bold text-blue-700">{bmi}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Z-Score:</span>
                    <span className="ml-2 font-bold text-purple-700">
                      {Math.round(zScore * 100) / 100}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phân loại:</span>
                    <span className={`ml-2 font-bold ${
                      color === 'green' ? 'text-green-700' :
                      color === 'yellow' ? 'text-yellow-700' :
                      color === 'orange' ? 'text-orange-700' :
                      color === 'red' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {classification}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">BMR:</span>
                    <span className="ml-2 font-bold text-indigo-700">
                      {calculateBMR(
                        parseFloat(weight),
                        parseFloat(height),
                        age,
                        selectedStudent.gender
                      ).toLocaleString()} cal/ngày
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tuổi:</span>
                    <span className="ml-2 font-bold text-gray-700">{age} tuổi</span>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !height || !weight}
            className={`px-6 py-3 rounded-xl font-medium transition-colors shadow-lg ${
              isSubmitting || !height || !weight
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : editingRecord
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white hover:shadow-xl'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'
            }`}
          >
            {isSubmitting
              ? '⏳ Đang xử lý...'
              : editingRecord
              ? '💾 Cập nhật kết quả'
              : '💾 Lưu kết quả đo'
            }
          </button>
        </div>
      </form>
    </div>
  );
}