<script lang="ts">
  export let links: Array<{
    name: string;
    url: string;
    icon: string;
    title?: string;
  }> = [];

  export let variant: 'default' | 'compact' | 'minimal' = 'default';
</script>

<div class="social-links {variant}">
  {#each links as link (link.name)}
    <a href={link.url} target="_blank" rel="noopener noreferrer" class="social-link" title={link.title || link.name}>
      {#if link.icon === 'github'}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      {:else if link.icon === 'linkedin'}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.736 0-9.646h3.554v1.348c.42-.648 1.36-1.573 3.322-1.573 2.429 0 4.251 1.574 4.251 4.963v5.908zM5.337 8.855c-1.144 0-1.915-.762-1.915-1.715 0-.957.77-1.715 1.958-1.715 1.187 0 1.927.758 1.94 1.715 0 .953-.753 1.715-1.983 1.715zm1.946 11.597H3.392V9.806h3.891v10.646zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
        </svg>
      {:else if link.icon === 'twitter'}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 002.856-3.215 9.954 9.954 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      {:else if link.icon === 'instagram'}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zm3.75 11.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zm1.5-5.25a.75.75 0 110-1.5.75.75 0 010 1.5z"/>
        </svg>
      {:else if link.icon === 'discord'}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.08.08 0 00.087-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 13.107 13.107 0 01-1.872-.892.077.077 0 00-.008-.128 10.713 10.713 0 00.372-.294.075.075 0 00.03-.066c.329-.246.649-.502.948-.764a.079.079 0 00.033-.109 13.30 13.30 0 00-4.487-6.649.077.077 0 00-.033-.015h-.001a.077.077 0 00-.028.005 10.28 10.28 0 00-3.23 3.23.076.076 0 00.012.106c.308.237.6.49.873.759a.075.075 0 00.03.066c.248.195.496.381.734.555a.076.076 0 00-.042.106 12.997 12.997 0 01-1.226 1.994.076.076 0 00.087.027 19.86 19.86 0 005.993-3.03.077.077 0 00.031-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.964-2.157 2.157-2.157 1.193 0 2.156.964 2.156 2.157 0 1.19-.963 2.156-2.156 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.964-2.157 2.157-2.157 1.193 0 2.157.964 2.157 2.157 0 1.19-.964 2.156-2.157 2.156z"/>
        </svg>
      {:else if link.icon === 'email'}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      {:else if link.icon === 'opera'}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="currentColor"/>
          <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="white"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>
      {/if}
      <span>{link.name}</span>
    </a>
  {/each}
</div>

<style>
  .social-links {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .social-links.compact {
    gap: 0.75rem;
  }

  .social-links.minimal {
    gap: 0.5rem;
  }

  .social-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: 4px;
    color: var(--n-gold2);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 700;
    transition: all 0.3s ease;
  }

  .social-link:hover {
    background: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.5);
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
    transform: translateY(-2px);
  }

  .social-link svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .social-links.compact .social-link {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .social-links.compact .social-link svg {
    width: 18px;
    height: 18px;
  }

  .social-links.minimal .social-link {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .social-links.minimal .social-link svg {
    width: 16px;
    height: 16px;
  }

  .social-links.minimal .social-link span {
    display: none;
  }

  .social-links.minimal .social-link:hover span {
    display: inline;
  }
</style>
