'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Heart, Reply, Trash2, Send, MoreVertical, Shield, ArrowRight, AtSign } from 'lucide-react'
import Link from 'next/link'

export default function TournamentComments({ tournamentId, isHost, previewMode = false }) {
  const [comments, setComments] = useState([])
  const [totalComments, setTotalComments] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionUsers, setMentionUsers] = useState([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef(null)

  const supabase = createClient()

  useEffect(() => {
    fetchUser()
    fetchComments()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('tournament_comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tournament_comments',
          filter: `tournament_id=eq.${tournamentId}`
        }, 
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tournamentId])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, chess_com_username')
        .eq('id', user.id)
        .single()
      
      setUserProfile(profile)
    }
  }

  const fetchComments = async () => {
    // Get total count first
    const { count } = await supabase
      .from('tournament_comments')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', tournamentId)
      .is('parent_id', null)

    setTotalComments(count || 0)

    // Fetch comments with limit if in preview mode
    const query = supabase
      .from('tournament_comments')
      .select(`
        *,
        profile:profiles(id, full_name, chess_com_username)
      `)
      .eq('tournament_id', tournamentId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (previewMode) {
      query.limit(2)
    }

    const { data, error } = await query

    if (!error && data) {
      // Fetch replies and mentions for each comment
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const replies = await fetchReplies(comment.id)
          const likesCount = await getLikesCount(comment.id)
          const userLiked = user ? await checkUserLiked(comment.id, user.id) : false
          const mentions = await fetchMentions(comment.id)
          
          return {
            ...comment,
            replies,
            likesCount,
            userLiked,
            mentions
          }
        })
      )
      
      setComments(commentsWithReplies)
    }
    
    setLoading(false)
  }

  const fetchReplies = async (parentId) => {
    const { data } = await supabase
      .from('tournament_comments')
      .select(`
        *,
        profile:profiles(id, full_name, chess_com_username)
      `)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true })

    if (!data) return []
    
    return await Promise.all(
      data.map(async (reply) => {
        const likesCount = await getLikesCount(reply.id)
        const userLiked = user ? await checkUserLiked(reply.id, user.id) : false
        const mentions = await fetchMentions(reply.id)
        return { ...reply, likesCount, userLiked, mentions }
      })
    )
  }

  const fetchMentions = async (commentId) => {
    const { data } = await supabase
      .from('comment_mentions')
      .select(`
        mentioned_profile_id,
        profile:profiles!comment_mentions_mentioned_profile_id_fkey(id, full_name, chess_com_username)
      `)
      .eq('comment_id', commentId)

    return data || []
  }

  const getLikesCount = async (commentId) => {
    const { count } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId)
    
    return count || 0
  }

  const checkUserLiked = async (commentId, userId) => {
    const { data } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('profile_id', userId)
      .maybeSingle()
    
    return !!data
  }

  const searchUsers = async (search) => {
    if (!search) {
      setMentionUsers([])
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, chess_com_username')
      .or(`full_name.ilike.%${search}%,chess_com_username.ilike.%${search}%`)
      .limit(5)

    setMentionUsers(data || [])
  }

  const handleCommentChange = (e) => {
    const value = e.target.value
    const position = e.target.selectionStart
    setNewComment(value)
    setCursorPosition(position)

    // Check if @ was just typed
    const textBeforeCursor = value.substring(0, position)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1)
      
      // Check if there's no space after @
      if (!textAfterAt.includes(' ')) {
        setShowMentions(true)
        setMentionSearch(textAfterAt)
        searchUsers(textAfterAt)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (user) => {
    const textBeforeCursor = newComment.substring(0, cursorPosition)
    const textAfterCursor = newComment.substring(cursorPosition)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
    
    const beforeAt = newComment.substring(0, lastAtSymbol)
    const mention = `@${user.chess_com_username || user.full_name} `
    const newText = beforeAt + mention + textAfterCursor
    
    setNewComment(newText)
    setShowMentions(false)
    setMentionSearch('')
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setSubmitting(true)

    // Insert comment
    const { data: comment, error } = await supabase
      .from('tournament_comments')
      .insert({
        tournament_id: tournamentId,
        profile_id: user.id,
        content: newComment.trim()
      })
      .select()
      .single()

    if (!error && comment) {
      // Extract and save mentions
      const mentionedUsernames = extractMentions(newComment)
      
      if (mentionedUsernames.length > 0) {
        // Find user IDs for mentioned usernames
        const { data: mentionedProfiles } = await supabase
          .from('profiles')
          .select('id, chess_com_username, full_name')
          .or(mentionedUsernames.map(username => 
            `chess_com_username.ilike.${username},full_name.ilike.${username}`
          ).join(','))

        if (mentionedProfiles && mentionedProfiles.length > 0) {
          // Insert mentions
          await supabase
            .from('comment_mentions')
            .insert(
              mentionedProfiles.map(profile => ({
                comment_id: comment.id,
                mentioned_profile_id: profile.id
              }))
            )
        }
      }

      setNewComment('')
      fetchComments()
    }

    setSubmitting(false)
  }

  const handleLike = async (commentId, isLiked) => {
    if (!user) return

    if (isLiked) {
      await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('profile_id', user.id)
    } else {
      await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          profile_id: user.id
        })
    }

    fetchComments()
  }

  const handleDelete = async (commentId, isOwnComment) => {
    if (isOwnComment) {
      if (!confirm('Delete this comment?')) return
      
      await supabase
        .from('tournament_comments')
        .delete()
        .eq('id', commentId)
    } else if (isHost) {
      if (!confirm('Delete this comment as host? The user will see it was removed by the host.')) return
      
      await supabase
        .from('tournament_comments')
        .update({
          deleted_by_host: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', commentId)
    }

    fetchComments()
  }

  if (loading) {
    return (
      <div className="px-3 mt-3 max-w-6xl mx-auto">
        <div className="rounded-md bg-white/80 dark:bg-[#121826] shadow p-6">
          <div className="text-center text-gray-500">Loading comments...</div>
        </div>
      </div>
    )
  }

  return (
          <div className="px-3 mt-3 max-w-6xl mx-auto">
        <div className="rounded-md bg-white/80 dark:bg-[#121826] backdrop-blur-xl shadow p-6 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <MessageCircle className="w-5 h-5" />
            Comments ({totalComments})
          </div>
          
          {previewMode && totalComments > 2 && (
            <Link href={`/tournaments/${tournamentId}/comments`}>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                View all comments
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}
        </div>

        {/* Comment Input - Only show in full mode */}
        {!previewMode && (
          user ? (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                {userProfile?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Write a comment... (use @ to mention someone)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md bg-white dark:bg-transparent text-sm focus:ring-1 focus:ring-blue-500 resize-none"
                  rows="3"
                  maxLength={2000}
                />
                
                {/* Mention Dropdown */}
                {showMentions && mentionUsers.length > 0 && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-white/10 max-h-48 overflow-y-auto z-20 w-64">
                    {mentionUsers.map((mentionUser) => (
                      <button
                        key={mentionUser.id}
                        type="button"
                        onClick={() => insertMention(mentionUser)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 border-b border-gray-100 dark:border-white/5 last:border-0"
                      >
                        <AtSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-semibold text-sm">{mentionUser.full_name}</div>
                          {mentionUser.chess_com_username && (
                            <div className="text-xs text-gray-500">@{mentionUser.chess_com_username}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/2000
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <AtSign className="w-3 h-3" />
                      Type @ to mention
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-500/30">
            <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Sign in to join the conversation
            </p>
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign in now
            </Link>
          </div>
        )
        )}

        {/* Sign in message in preview mode */}
        {previewMode && !user && (
          <div className="text-center py-4 mt-5 text-gray-500 text-sm">
            <Link href={`/tournaments/${tournamentId}/comments`} className="text-blue-600 dark:text-blue-400 hover:underline">
              View all comments and join the discussion
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              isHost={isHost}
              onLike={handleLike}
              onDelete={handleDelete}
              tournamentId={tournamentId}
              fetchComments={fetchComments}
              previewMode={previewMode}
            />
          ))}

          {comments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {previewMode ? (
                <Link href={`/tournaments/${tournamentId}/comments`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  Be the first to comment!
                </Link>
              ) : (
                'No comments yet. Be the first to comment!'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CommentItem({ comment, user, isHost, onLike, onDelete, tournamentId, fetchComments, previewMode }) {
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionUsers, setMentionUsers] = useState([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const replyInputRef = useRef(null)
  const supabase = createClient()

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  const searchUsers = async (search) => {
    if (!search) {
      setMentionUsers([])
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, chess_com_username')
      .or(`full_name.ilike.%${search}%,chess_com_username.ilike.%${search}%`)
      .limit(5)

    setMentionUsers(data || [])
  }

  const handleReplyChange = (e) => {
    const value = e.target.value
    const position = e.target.selectionStart
    setReplyText(value)
    setCursorPosition(position)

    const textBeforeCursor = value.substring(0, position)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1)
      
      if (!textAfterAt.includes(' ')) {
        setShowMentions(true)
        setMentionSearch(textAfterAt)
        searchUsers(textAfterAt)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (mentionUser) => {
    const textBeforeCursor = replyText.substring(0, cursorPosition)
    const textAfterCursor = replyText.substring(cursorPosition)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
    
    const beforeAt = replyText.substring(0, lastAtSymbol)
    const mention = `@${mentionUser.chess_com_username || mentionUser.full_name} `
    const newText = beforeAt + mention + textAfterCursor
    
    setReplyText(newText)
    setShowMentions(false)
    setMentionSearch('')
    
    setTimeout(() => {
      replyInputRef.current?.focus()
    }, 0)
  }

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !user) return

    setSubmittingReply(true)

    const { data: reply, error } = await supabase
      .from('tournament_comments')
      .insert({
        tournament_id: tournamentId,
        profile_id: user.id,
        parent_id: comment.id,
        content: replyText.trim()
      })
      .select()
      .single()

    if (!error && reply) {
      const mentionedUsernames = extractMentions(replyText)
      
      if (mentionedUsernames.length > 0) {
        const { data: mentionedProfiles } = await supabase
          .from('profiles')
          .select('id, chess_com_username, full_name')
          .or(mentionedUsernames.map(username => 
            `chess_com_username.ilike.${username},full_name.ilike.${username}`
          ).join(','))

        if (mentionedProfiles && mentionedProfiles.length > 0) {
          await supabase
            .from('comment_mentions')
            .insert(
              mentionedProfiles.map(profile => ({
                comment_id: reply.id,
                mentioned_profile_id: profile.id
              }))
            )
        }
      }

      setReplyText('')
      setShowReplyBox(false)
      fetchComments()
    }

    setSubmittingReply(false)
  }

  const renderContentWithMentions = (content, mentions) => {
    if (!mentions || mentions.length === 0) {
      return <span>{content}</span>
    }

    const parts = []
    let lastIndex = 0
    const mentionRegex = /@(\w+)/g
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1]
      const mention = mentions.find(m => 
        m.profile?.chess_com_username?.toLowerCase() === username.toLowerCase() ||
        m.profile?.full_name?.toLowerCase() === username.toLowerCase()
      )

      if (mention) {
        // Add text before mention
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index))
        }

        // Add mention as clickable element
        parts.push(
          <span
            key={match.index}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            @{username}
          </span>
        )

        lastIndex = match.index + match[0].length
      }
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return <>{parts}</>
  }

  const isOwnComment = user?.id === comment.profile_id
  const canDelete = isOwnComment || isHost

  if (comment.deleted_by_host) {
    return (
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="flex-1">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Comment removed by host</span>
              </div>
              <p className="text-xs text-red-500 dark:text-red-400/70 mt-1">
                This comment violated tournament guidelines and was removed on {new Date(comment.deleted_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 group">
<div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
          {comment.profile?.full_name?.charAt(0) || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="border-b border-gray-200 dark:border-white/10 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 items-center gap-2 text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {comment.profile?.full_name || 'Unknown User'}
                </div>
                {comment.profile?.chess_com_username && (
                  <div className="text-xs text-gray-500">
                    @{comment.profile.chess_com_username}
                  </div>
                  
                )}
              </div>
              
              {canDelete && !previewMode && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-white/10 py-1 z-10 min-w-[160px]">
                      <button
                        onClick={() => {
                          onDelete(comment.id, isOwnComment)
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isOwnComment ? 'Delete' : 'Remove (Host)'}
                      </button>
                      {isHost && !isOwnComment && (
                        <div className="px-4 py-1 text-xs text-gray-500 border-t border-gray-200 dark:border-white/10 mt-1">
                          <Shield className="w-3 h-3 inline mr-1" />
                          Host action
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="mt-2 text-sm whitespace-pre-wrap break-words">
              {renderContentWithMentions(comment.content, comment.mentions)}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-2 px-2 text-xs text-gray-500">
            <span>{timeAgo(comment.created_at)}</span>
            
            <button
              onClick={() => onLike(comment.id, comment.userLiked)}
              disabled={!user || previewMode}
              className={`flex items-center gap-1 hover:text-red-500 transition ${
                comment.userLiked ? 'text-red-500 font-semibold' : ''
              } ${(!user || previewMode) ? 'cursor-default' : ''}`}
            >
              <Heart className={`w-4 h-4 ${comment.userLiked ? 'fill-current' : ''}`} />
              {comment.likesCount > 0 && comment.likesCount}
            </button>

            {user && !previewMode && (
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="flex items-center gap-1 hover:text-blue-500 transition"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}
          </div>

          {showReplyBox && !previewMode && (
            <form onSubmit={handleSubmitReply} className="mt-3 relative">
              <div className="flex gap-2">
                <input
                  ref={replyInputRef}
                  type="text"
                  value={replyText}
                  onChange={handleReplyChange}
                  placeholder="Write a reply... (use @ to mention)"
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  maxLength={2000}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || submittingReply}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full text-sm transition"
                >
                  {submittingReply ? '...' : 'Send'}
                </button>
              </div>
              
              {showMentions && mentionUsers.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-white/10 max-h-48 overflow-y-auto z-20 w-64">
                  {mentionUsers.map((mentionUser) => (
                    <button
                      key={mentionUser.id}
                      type="button"
                      onClick={() => insertMention(mentionUser)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 border-b border-gray-100 dark:border-white/5 last:border-0"
                    >
                      <AtSign className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-semibold text-sm">{mentionUser.full_name}</div>
                        {mentionUser.chess_com_username && (
                          <div className="text-xs text-gray-500">@{mentionUser.chess_com_username}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  user={user}
                  isHost={isHost}
                  onLike={onLike}
                  onDelete={onDelete}
                  timeAgo={timeAgo}
                  previewMode={previewMode}
                  renderContentWithMentions={renderContentWithMentions}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReplyItem({ reply, user, isHost, onLike, onDelete, timeAgo, previewMode, renderContentWithMentions }) {
  const [showMenu, setShowMenu] = useState(false)
  const isOwnReply = user?.id === reply.profile_id
  const canDelete = isOwnReply || isHost

  if (reply.deleted_by_host) {
    return (
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-3 h-3 text-gray-500" />
        </div>
        <div className="flex-1">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-2xl px-3 py-2">
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs">
              <Shield className="w-3 h-3" />
              <span className="font-medium">Reply removed by host</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 group">
<div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
        {reply.profile?.full_name?.charAt(0) || 'U'}
      </div>
      
      <div className="flex-1">
        <div className="ml-2 pl-4 border-l border-gray-200 dark:border-white/10">
          {canDelete && !previewMode && (
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-white/10 py-1 z-10 min-w-[160px]">
                  <button
                    onClick={() => {
                      onDelete(reply.id, isOwnReply)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isOwnReply ? 'Delete' : 'Remove (Host)'}
                  </button>
                  {isHost && !isOwnReply && (
                    <div className="px-4 py-1 text-xs text-gray-500 border-t border-gray-200 dark:border-white/10 mt-1">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Host action
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="font-semibold text-sm">
            {reply.profile?.full_name || 'Unknown User'}
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap break-words pr-6">
            {renderContentWithMentions(reply.content, reply.mentions)}
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-1 px-2 text-xs text-gray-500">
          <span>{timeAgo(reply.created_at)}</span>
          <button
            onClick={() => onLike(reply.id, reply.userLiked)}
            disabled={!user || previewMode}
            className={`flex items-center gap-1 hover:text-red-500 transition ${
              reply.userLiked ? 'text-red-500 font-semibold' : ''
            } ${(!user || previewMode) ? 'cursor-default' : ''}`}
          >
            <Heart className={`w-3 h-3 ${reply.userLiked ? 'fill-current' : ''}`} />
            {reply.likesCount > 0 && reply.likesCount}
          </button>
        </div>
      </div>
    </div>
  )
}