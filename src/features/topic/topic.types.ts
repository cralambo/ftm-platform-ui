export interface Topic {
  id: string;
  name: string;
  description: string | null;
}

// ShortTopicResponse : listes déroulantes et objets imbriqués
export interface ShortTopic {
  id: string;
  name: string;
}

// Valeurs du formulaire
export interface TopicInput {
  name: string;
  description: string;
}