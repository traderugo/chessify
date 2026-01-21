export default function Modal({ children, isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}