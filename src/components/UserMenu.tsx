import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, LogOut, History } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserMenuProps {
  email: string;
  onSignOut: () => void;
  onShowHistory: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ email, onSignOut, onShowHistory }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      onSignOut();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <span className="hidden md:inline text-sm">{email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <button
            onClick={() => {
              onShowHistory();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <History className="h-4 w-4 mr-2" />
            {t('user.history')}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('user.signOut')}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;