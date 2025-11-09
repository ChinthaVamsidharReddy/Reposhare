import React, { useState, useMemo } from 'react';
import { CheckIcon, ChartBarIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
dayjs.extend(relativeTime);

const PollDisplay = ({ poll, onVote, className = '', isOwn = false }) => {
  const { user } = useAuth();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(() => {
    const userId = user?.id || localStorage.getItem("userId");
    return Boolean(
      poll?.options?.some((option) =>
        (option.votes || []).some((vote) => {
          // Handle both object format {userId} and direct ID format
          const voteId = typeof vote === 'object' ? vote.userId : vote;
          return String(voteId) === String(userId);
        })
      )
    );
  });

  // Derived safe values
  const safeOptions = poll?.options || [];
  const totalVotes = poll?.totalVotes ?? safeOptions.reduce((s, o) => s + (o.votes?.length || 0), 0);
  const createdAtIso = poll?.createdAt || poll?.timestamp || null;

  const handleOptionSelect = (optionId) => {
    if (hasVoted) return;

    if (poll?.allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = () => {
    if (selectedOptions.length > 0 && !hasVoted) {
      onVote?.(poll.id || poll.pollId, selectedOptions);
      setHasVoted(true);
      setSelectedOptions([]);
    }
  };

  const getVotePercentage = (option) => {
    if (!totalVotes) return 0;
    return Math.round(((option.votes?.length || 0) / totalVotes) * 100);
  };

  const getUserVotedOptions = () => {
    const userId = user?.id || localStorage.getItem("userId");
    return safeOptions
      .filter((option) =>
        (option.votes || []).some((v) => {
          const voteId = typeof v === 'object' ? v.userId : v;
          return String(voteId) === String(userId);
        })
      )
      .map((o) => o.id);
  };

  const userVotedOptions = useMemo(getUserVotedOptions, [poll, user]);

  // time labels
  const relativeLabel = createdAtIso ? dayjs(createdAtIso).fromNow() : '';
  const exactLabel = createdAtIso ? dayjs(createdAtIso).format('hh:mm A, MMM D, YYYY') : '';

  // styling - WhatsApp-like design
  const containerBase = `rounded-2xl ${className}`;
  const bgClass = isOwn
    ? 'bg-[#005c4b] text-black shadow-md'
    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-dark-text shadow-sm border border-gray-200 dark:border-gray-700';

  return (
    <div className={`${containerBase} ${bgClass} p-4`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`flex-shrink-0 ${isOwn ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900'} rounded-full p-2`}>
          <ChartBarIcon className={`${isOwn ? 'text-white' : 'text-blue-600 dark:text-blue-400'} h-5 w-5`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold mb-3 text-base ${isOwn ? 'text-white' : 'text-gray-900 dark:text-dark-text'}`}>
            {poll.question || 'Untitled poll'}
          </h4>

          <div className="space-y-2.5">
            {safeOptions.map((option) => {
              const percentage = getVotePercentage(option);
              const isSelected = selectedOptions.includes(option.id);
              const isUserVoted = userVotedOptions.includes(option.id);
              const voteCount = option.votes?.length || 0;

              // WhatsApp-like option styling
              const optionBaseClass = `w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                hasVoted ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
              }`;
              
              const optionBgClass = isSelected || isUserVoted
                ? isOwn
                  ? 'bg-white/20 border-white/30'
                  : 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                : isOwn
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700';

              return (
                <div key={option.id} className="relative">
                  <button
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={hasVoted}
                    className={`${optionBaseClass} ${optionBgClass}`}
                  >
                    {/* Progress bar - WhatsApp style */}
                    {hasVoted && voteCount > 0 && (
                      <div
                        className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                          isOwn 
                            ? 'bg-white/25' 
                            : 'bg-blue-100 dark:bg-blue-800/50'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    <div className="relative flex items-center justify-between z-10">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Check mark or radio button */}
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected || isUserVoted
                            ? isOwn
                              ? 'bg-white border-white'
                              : 'bg-blue-500 border-blue-500'
                            : isOwn
                            ? 'border-white/50'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {(isSelected || isUserVoted) && (
                            <CheckIcon className={`h-3 w-3 ${
                              isOwn ? 'text-[#005c4b]' : 'text-white'
                            }`} />
                          )}
                        </div>
                        <span className={`text-sm font-medium truncate ${
                          isOwn ? 'text-white' : 'text-gray-900 dark:text-dark-text'
                        }`}>
                          {option.text}
                        </span>
                      </div>
                      {hasVoted && (
                        <div className={`flex items-center gap-2 text-xs font-medium ml-2 flex-shrink-0 ${
                          isOwn ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          <span>{percentage}%</span>
                          {!poll.anonymous && (
                            <span className="opacity-75">({voteCount})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {!hasVoted && selectedOptions.length > 0 && (
            <button
              onClick={handleVote}
              className={`mt-4 px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all ${
                isOwn 
                  ? 'bg-white text-[#005c4b] hover:bg-white/90' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Vote
            </button>
          )}

          <div className={`mt-4 pt-3 border-t ${
            isOwn ? 'border-white/20' : 'border-gray-200 dark:border-gray-700'
          } flex items-center justify-between text-xs`}>
            <div className={`flex items-center gap-1.5 ${isOwn ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
              <UserIcon className="h-3.5 w-3.5" />
              <span className="font-medium">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
            </div>

            <div className={`text-right ${isOwn ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className="text-[11px]">
                {poll.anonymous ? 'Anonymous' : 'Public'} • {poll.allowMultiple ? 'Multiple' : 'Single'}
              </div>
              {createdAtIso && (
                <div className="text-[10px] opacity-75 mt-0.5">
                  {relativeLabel}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDisplay;
