<script lang="ts">
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  // 공통 컴포넌트 임포트
  import AuthCard from '$lib/components/ui/styles/AuthCard.svelte';
  import Form from '$lib/components/ui/styles/Form.svelte';
  import FormGroup from '$lib/components/ui/styles/FormGroup.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import Loading from '$lib/components/ui/Loading.svelte';

  // 폼 상태
  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let isSubmitting = false;
  let formError = '';

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  onMount(() => {
    const unsubscribe = isAuthenticated.subscribe(value => {
      if (value) {
        goto('/dashboard');
      }
    });

    return unsubscribe;
  });

  // 회원가입 처리
  async function handleSubmit() {
    // 폼 유효성 검사
    if (!name) {
      formError = '이름을 입력해주세요.';
      return;
    }

    if (!email) {
      formError = '이메일을 입력해주세요.';
      return;
    }

    if (!password) {
      formError = '비밀번호를 입력해주세요.';
      return;
    }

    if (password.length < 6) {
      formError = '비밀번호는 최소 6자 이상이어야 합니다.';
      return;
    }

    if (password !== confirmPassword) {
      formError = '비밀번호가 일치하지 않습니다.';
      return;
    }

    formError = '';
    isSubmitting = true;

    try {
      const success = await authStore.register({
        name,
        email,
        password
      });
      
      if (success) {
        goto('/dashboard');
      } else {
        // 스토어에서 오류 메시지 가져오기
        authStore.subscribe(state => {
          formError = state.error || '회원가입에 실패했습니다.';
        })();
      }
    } catch (error) {
      formError = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<AuthCard 
  title="회원가입" 
  subtitle="이미 계정이 있으신가요?" 
  subtitleLink="/login" 
  subtitleLinkText="로그인"
>
  <Form on:submit={handleSubmit}>
    <FormGroup>
      <Input
        type="text"
        id="name"
        name="name"
        label="이름"
        placeholder="이름을 입력하세요"
        required={true}
        bind:value={name}
      />
    </FormGroup>
    
    <FormGroup>
      <Input
        type="email"
        id="email-address"
        name="email"
        label="이메일"
        placeholder="이메일을 입력하세요"
        autocomplete="email"
        required={true}
        bind:value={email}
      />
    </FormGroup>
    
    <FormGroup>
      <Input
        type="password"
        id="password"
        name="password"
        label="비밀번호"
        placeholder="비밀번호 (6자 이상)"
        autocomplete="new-password"
        required={true}
        bind:value={password}
      />
    </FormGroup>
    
    <FormGroup>
      <Input
        type="password"
        id="confirm-password"
        name="confirm-password"
        label="비밀번호 확인"
        placeholder="비밀번호를 다시 입력하세요"
        autocomplete="new-password"
        required={true}
        bind:value={confirmPassword}
      />
    </FormGroup>
    
    {#if formError}
      <Alert type="error" message={formError} />
    {/if}
    
    {#if $authStore.loading}
      <Loading text="회원가입 중..." />
    {/if}
    
    <Button
      type="submit"
      variant="primary"
      fullWidth={true}
      disabled={isSubmitting || $authStore.loading}
    >
      회원가입
    </Button>
  </Form>
</AuthCard> 