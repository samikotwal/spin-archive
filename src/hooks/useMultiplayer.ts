import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  code: string;
  host_id: string;
  wheel_id: string | null;
  is_active: boolean;
  created_at: string;
}

interface Participant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}

export const useMultiplayer = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const { toast } = useToast();

  const createRoom = async (wheelId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: 'Login required', variant: 'destructive' }); return null; }

    const { data, error } = await supabase
      .from('rooms')
      .insert({ host_id: user.id, wheel_id: wheelId || null })
      .select()
      .single();

    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return null; }

    const newRoom = data as Room;
    setRoom(newRoom);
    setIsHost(true);

    // Host joins as participant
    await supabase.from('participants').insert({ room_id: newRoom.id, user_id: user.id });

    toast({ title: 'Room Created', description: `Code: ${newRoom.code}` });
    return newRoom;
  };

  const joinRoom = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: 'Login required', variant: 'destructive' }); return false; }

    const { data: roomData, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !roomData) {
      toast({ title: 'Room not found', description: 'Check the code and try again', variant: 'destructive' });
      return false;
    }

    const foundRoom = roomData as Room;
    await supabase.from('participants').insert({ room_id: foundRoom.id, user_id: user.id });
    setRoom(foundRoom);
    setIsHost(foundRoom.host_id === user.id);
    toast({ title: 'Joined Room', description: `Connected to room ${foundRoom.code}` });
    return true;
  };

  const leaveRoom = async () => {
    if (!room) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('participants').delete().eq('room_id', room.id).eq('user_id', user.id);

    if (isHost) {
      await supabase.from('rooms').update({ is_active: false }).eq('id', room.id);
    }

    setRoom(null);
    setParticipants([]);
    setIsHost(false);
  };

  // Realtime subscriptions
  useEffect(() => {
    if (!room) return;

    const channel = supabase
      .channel(`room-${room.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${room.id}` },
        () => { fetchParticipants(room.id); }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
        (payload) => {
          const updated = payload.new as Room;
          setRoom(updated);
          if (!updated.is_active) {
            toast({ title: 'Room Closed', description: 'The host closed this room' });
            setRoom(null);
            setParticipants([]);
          }
        }
      )
      .subscribe();

    fetchParticipants(room.id);

    return () => { supabase.removeChannel(channel); };
  }, [room?.id]);

  const fetchParticipants = async (roomId: string) => {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', roomId);
    setParticipants((data as Participant[]) || []);
  };

  return { room, participants, isHost, createRoom, joinRoom, leaveRoom };
};
